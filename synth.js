/*
  Copyright (c) 2017, miya
  All rights reserved.

  Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

  1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

  2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
  IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

function Synthesizer()
{
  var STATE_ATTACK = 0;
  var STATE_DECAY = 1;
  var STATE_SUSTAIN = 2;
  var STATE_RELEASE = 3;
  var STATE_SLEEP = 4;
  var WAVE_BUFFER_BITS = 8;
  var INT_BITS = 32;
  var FIXED_BITS = 14;
  var FIXED_BITS_ENV = 8;
  var WAVE_ADDR_SHIFT = (INT_BITS - WAVE_BUFFER_BITS);
  var WAVE_ADDR_SHIFT_M = (WAVE_ADDR_SHIFT - FIXED_BITS);
  var FIXED_SCALE = (1 << FIXED_BITS);
  var FIXED_SCALE_M1 = (FIXED_SCALE - 1);
  var WAVE_BUFFER_SIZE = (1 << WAVE_BUFFER_BITS);
  var WAVE_BUFFER_SIZE_M1 = (WAVE_BUFFER_SIZE - 1);
  var ENV_VALUE_MAX = (1 << FIXED_BITS << FIXED_BITS_ENV);
  var MOD_LEVEL_MAX = (Math.floor(FIXED_SCALE * 0.52));
  var DEFAULT_LEVEL = (Math.floor(FIXED_SCALE / 4));
  var BUFFER_LENGTH = 2048;

  var oscs = 4;
  var reverbLLength = 0.5111;
  var reverbRLength = 0.5;
  var reverbLSize = 0;
  var reverbRSize = 0;
  var reverbVolume = (Math.floor(FIXED_SCALE * 0.3));
  var reverbDecay = 0.8;
  var outVolume = (1.0 / FIXED_SCALE);

  var self = this;
  var callback = null;
  var callbackRate = 0;
  var callbackCounter = 0;
  var reverbCounter = 0;
  var reverbAddrL = 0;
  var reverbAddrR = 0;
  var outL = 0;
  var outR = 0;
  var waac = null;
  var wasp = null;
  var waveData = [];

  var reverbBufferL = [];
  var reverbBufferR = [];
  var params = [];

  function Param()
  {
    this.envelopeLevelA = 0;
    this.envelopeLevelS = 0;
    this.envelopeDiffA = 0;
    this.envelopeDiffD = 0;
    this.envelopeDiffR = 0;
    this.modPatch0 = 0;
    this.modPatch1 = 0;
    this.modLevel0 = 0;
    this.modLevel1 = 0;
    this.levelL = 0;
    this.levelR = 0;
    this.levelRev = 0;

    this.state = 0;
    this.count = 0;
    this.currentLevel = 0;
    this.pitch = 0;
    this.mod0 = 0;
    this.mod1 = 0;
    this.outData = 0;
    this.outWaveL = 0;
    this.outWaveR = 0;
    this.outRevL = 0;
    this.outRevR = 0;
    this.mixOut = false;
    this.noteOn = false;
    this.noteOnSave = false;
  }

  var sp_process = function(ev)
  {
    var i;
    var bufL = ev.outputBuffer.getChannelData(0);
    var bufR = ev.outputBuffer.getChannelData(1);

    for (i = 0; i < BUFFER_LENGTH; i++)
    {
      callbackCounter++;
      if (callbackCounter > callbackRate)
      {
        callbackCounter = 0;
        callback();
      }
      render();
      bufL[i] = outL;
      bufR[i] = outR;
    }
  };

  this.init = function()
  {
    var i, reverbLBufferSize, reverbRBufferSize;
    if (waac)
    {
      waac.close();
    }
    waac = new AudioContext();
    reverbLSize = Math.floor(this.getSampleRate() * reverbLLength);
    reverbRSize = Math.floor(this.getSampleRate() * reverbRLength);
    reverbLBufferSize = (reverbLSize + 0x800) & (~0x7ff);
    reverbRBufferSize = (reverbRSize + 0x800) & (~0x7ff);
    reverbBufferL = new Array(reverbLBufferSize);
    reverbBufferR = new Array(reverbRBufferSize);
    for (i = 0; i < reverbLBufferSize; i++)
    {
      reverbBufferL[i] = 0;
    }
    for (i = 0; i < reverbRBufferSize; i++)
    {
      reverbBufferR[i] = 0;
    }

    for (i = 0; i < WAVE_BUFFER_SIZE; i++)
    {
      waveData[i] = Math.floor(Math.sin(Math.PI * 2.0 / WAVE_BUFFER_SIZE * i) * FIXED_SCALE);
    }

    for (i = 0; i < oscs; i++)
    {
      params[i] = new Param();

      params[i].state = STATE_SLEEP;
      params[i].envelopeLevelA = ENV_VALUE_MAX;
      params[i].envelopeLevelS = 0;
      params[i].envelopeDiffA = ENV_VALUE_MAX >> 3;
      params[i].envelopeDiffD = (- ENV_VALUE_MAX) >> 15;
      params[i].envelopeDiffR = (- ENV_VALUE_MAX) >> 13;
      params[i].levelL = DEFAULT_LEVEL;
      params[i].levelR = DEFAULT_LEVEL;
      params[i].levelRev = reverbVolume;
      params[i].mixOut = true;
      params[i].modPatch0 = i;
      params[i].modPatch1 = i;
      params[i].modLevel0 = MOD_LEVEL_MAX * rand(6);
      params[i].modLevel1 = 0;
    }

    reverbAddrL = 0;
    reverbAddrR = 0;
    reverbCounter = 0;
  };

  // from callback
  var render = function()
  {
    var i, waveAddrF, waveAddrR, oscOutF, oscOutR, waveAddrM, oscOut, limitValue, valueDiff, limitGt, waveAddr, mixL, mixR, mixRevL, mixRevR, reverbL, reverbR;
    // patch
    for (i = 0; i < oscs; i++)
    {
      params[i].mod0 = params[params[i].modPatch0].outData;
      params[i].mod1 = params[params[i].modPatch1].outData;
    }

    // synth
    for (i = 0; i < oscs; i++)
    {
      // envelope generator
      if ((params[i].noteOn === true) && (params[i].noteOnSave !== params[i].noteOn))
      {
        params[i].state = STATE_ATTACK;
      }
      if ((params[i].noteOn === false) && (params[i].noteOnSave !== params[i].noteOn))
      {
        params[i].state = STATE_RELEASE;
      }
      params[i].noteOnSave = params[i].noteOn;

      if (params[i].state === STATE_SLEEP)
      {
        params[i].count = 0;
      }

      limitValue = 0;
      valueDiff = 0;
      limitGt = false;

      if (params[i].state === STATE_ATTACK)
      {
        limitValue = params[i].envelopeLevelA;
        valueDiff = params[i].envelopeDiffA;
        limitGt = true;
      }
      else if (params[i].state === STATE_DECAY)
      {
        limitValue = params[i].envelopeLevelS;
        valueDiff = params[i].envelopeDiffD;
        limitGt = false;
      }
      else if (params[i].state === STATE_RELEASE)
      {
        limitValue = 0;
        valueDiff = params[i].envelopeDiffR;
        limitGt = false;
      }

      params[i].currentLevel += valueDiff;

      if (((limitGt === true) && (params[i].currentLevel > limitValue)) ||
          ((limitGt === false) && (params[i].currentLevel < limitValue)))
      {
        params[i].currentLevel = limitValue;
        params[i].state++;
      }

      waveAddr = (params[i].count +
                  (params[i].mod0 * params[i].modLevel0) +
                  (params[i].mod1 * params[i].modLevel1)) >>> WAVE_ADDR_SHIFT_M;

      // fetch wave data
      waveAddrF = waveAddr >> FIXED_BITS;
      waveAddrR = (waveAddrF + 1) & WAVE_BUFFER_SIZE_M1;
      oscOutF = waveData[waveAddrF];
      oscOutR = waveData[waveAddrR];
      waveAddrM = waveAddr & FIXED_SCALE_M1;
      oscOut = ((oscOutF * (FIXED_SCALE - waveAddrM)) >> FIXED_BITS) +
        ((oscOutR * waveAddrM) >> FIXED_BITS);
      params[i].outData = (oscOut * (params[i].currentLevel >> FIXED_BITS_ENV)) >> FIXED_BITS;
      params[i].count += params[i].pitch;

      // mix
      if (params[i].mixOut === 0)
      {
        params[i].outWaveL = 0;
        params[i].outWaveR = 0;
        params[i].outRevL = 0;
        params[i].outRevR = 0;
      }
      else
      {
        params[i].outWaveL = (params[i].outData * params[i].levelL) >> FIXED_BITS;
        params[i].outWaveR = (params[i].outData * params[i].levelR) >> FIXED_BITS;
        params[i].outRevL = (params[i].outWaveL * params[i].levelRev) >> FIXED_BITS;
        params[i].outRevR = (params[i].outWaveR * params[i].levelRev) >> FIXED_BITS;
      }
    }

    // mixing
    mixL = 0;
    mixR = 0;
    mixRevL = 0;
    mixRevR = 0;
    for (i = 0; i < oscs; i++)
    {
      mixL += params[i].outWaveL;
      mixR += params[i].outWaveR;
      mixRevL += params[i].outRevL;
      mixRevR += params[i].outRevR;
    }

    // reverb
    reverbL = reverbBufferR[reverbAddrR] * reverbDecay;
    reverbR = reverbBufferL[reverbAddrL] * reverbDecay;
    reverbL += mixRevR;
    reverbR += mixRevL;
    reverbBufferL[reverbAddrL] = reverbL;
    reverbBufferR[reverbAddrR] = reverbR;
    reverbAddrL++;
    if (reverbAddrL > reverbLSize)
    {
      reverbAddrL = 0;
    }
    reverbAddrR++;
    if (reverbAddrR > reverbRSize)
    {
      reverbAddrR = 0;
    }
    outL = (mixL + reverbBufferL[reverbAddrL]) * outVolume;
    outR = (mixR + reverbBufferR[reverbAddrR]) * outVolume;
  };


  this.start = function()
  {
    var i;
    wasp = waac.createScriptProcessor(BUFFER_LENGTH, 2, 2);
    wasp.onaudioprocess = sp_process;
    wasp.connect(waac.destination);
  };

  this.stop = function()
  {
    if (wasp)
    {
      wasp.disconnect();
    }
  };

  this.getSampleRate = function()
  {
    return waac.sampleRate;
  };

  this.getWaveBufferSize = function()
  {
    return WAVE_BUFFER_SIZE;
  };

  this.getEnvValueMax = function()
  {
    return ENV_VALUE_MAX;
  };

  this.getOscs = function()
  {
    return oscs;
  };

  this.getModLevelMax = function()
  {
    return MOD_LEVEL_MAX;
  };

  this.getParams = function(osc)
  {
    return params[osc];
  };

  this.setCallback = function(callback_arg)
  {
    callback = callback_arg;
  };

  this.setCallbackRate = function(callbackRate_arg)
  {
    callbackRate = callbackRate_arg;
    callbackCounter = 0;
  };

  this.setSynthParam = function(oscs_arg, reverbLLength_arg, reverbRLength_arg, reverbVolume_arg, reverbDecay_arg, outVolume_arg)
  {
    oscs = oscs_arg;
    reverbLLength = reverbLLength_arg;
    reverbRLength = reverbRLength_arg;
    reverbVolume = reverbVolume_arg;
    reverbDecay = reverbDecay_arg;
    outVolume = outVolume_arg;
  };
}
