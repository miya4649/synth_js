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
var OSCS = 4;
var REVERB_BUFFER_SIZE = 0x3000;
var REVERB_L_SIZE = (REVERB_BUFFER_SIZE - 1);
var REVERB_R_SIZE = (Math.floor(REVERB_BUFFER_SIZE * 0.49));
var REVERB_VOLUME = (Math.floor(FIXED_SCALE * 0.3));
var TEMPO = 6.0;
var OUT_VOLUME = (1.0 / FIXED_SCALE);
var SEQ_LENGTH = 16;
var BUFFER_LENGTH = 2048;
var SCALE_BUFFER_SIZE = 16;
var CONST03 = (1 << FIXED_BITS << FIXED_BITS_ENV);
var CONST04 = (FIXED_SCALE >> 0);
var CONST05 = (Math.floor(CONST04 / OSCS));

var counter;
var seqCounter;
var barCounter;
var deleteCounter;
var chord;
var note;
var sc;
var reverbCounter;
var reverbAddrL;
var reverbAddrR;
var outL;
var outR;
var tempoCount;
var waac;
var wasp;
var waveData = [];
var scaleTable = [];
var CHORD_LENGTH = 5;
var CHORDS = 6;
var chordData = [
  [0,2,4,7,11,0,0,0],
  [2,4,5,7,11,0,0,0],
  [0,4,7,9,11,0,0,0],
  [0,4,5,7,9,0,0,0],
  [0,2,4,5,9,0,0,0],
  [2,5,7,9,11,0,0,0],
];

var reverbBufferL = new Array(REVERB_BUFFER_SIZE);
var reverbBufferR = new Array(REVERB_BUFFER_SIZE);
var seqData = [];
var params = [];

function NoteData()
{
  this.note = 0;
  this.oct = 0;
}

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

var rand = function(max)
{
  return Math.floor(Math.random() * max);
};

var synth = function()
{
  // patch
  for (var i = 0; i < OSCS; i++)
  {
    params[i].mod0 = params[params[i].modPatch0].outData;
    params[i].mod1 = params[params[i].modPatch1].outData;
  }

  for (var i = 0; i < OSCS; i++)
  {
    // envelope generator
    if ((params[i].noteOn == true) && (params[i].noteOnSave != params[i].noteOn))
    {
      params[i].state = STATE_ATTACK;
    }
    if ((params[i].noteOn == false) && (params[i].noteOnSave != params[i].noteOn))
    {
      params[i].state = STATE_RELEASE;
    }
    params[i].noteOnSave = params[i].noteOn;
    
    if (params[i].state == STATE_SLEEP)
    {
      params[i].count = 0;
    }

    var limitValue = 0;
    var valueDiff = 0;
    var limitGt = false;
    
    if (params[i].state == STATE_ATTACK)
    {
      limitValue = params[i].envelopeLevelA;
      valueDiff = params[i].envelopeDiffA;
      limitGt = true;
    }
    else if (params[i].state == STATE_DECAY)
    {
      limitValue = params[i].envelopeLevelS;
      valueDiff = params[i].envelopeDiffD;
      limitGt = false;
    }
    else if (params[i].state == STATE_RELEASE)
    {
      limitValue = 0;
      valueDiff = params[i].envelopeDiffR;
      limitGt = false;
    }
    
    params[i].currentLevel += valueDiff;
    
    if (((limitGt == true) && (params[i].currentLevel > limitValue)) ||
        ((limitGt == false) && (params[i].currentLevel < limitValue)))
    {
      params[i].currentLevel = limitValue;
      params[i].state++;
    }

    var waveAddr = (params[i].count +
                    (params[i].mod0 * params[i].modLevel0) +
                    (params[i].mod1 * params[i].modLevel1)) >>> WAVE_ADDR_SHIFT_M;

    // fetch wave data
    var waveAddrF = waveAddr >> FIXED_BITS;
    var waveAddrR = (waveAddrF + 1) & WAVE_BUFFER_SIZE_M1;    
    var oscOutF = waveData[waveAddrF];
    var oscOutR = waveData[waveAddrR];
    var waveAddrM = waveAddr & FIXED_SCALE_M1;
    var oscOut = ((oscOutF * (FIXED_SCALE - waveAddrM)) >> FIXED_BITS) +
      ((oscOutR * waveAddrM) >> FIXED_BITS);
    params[i].outData = (oscOut * (params[i].currentLevel >> FIXED_BITS_ENV)) >> FIXED_BITS;
    params[i].count += params[i].pitch;

    // mix
    if (params[i].mixOut == 0)
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
};

var setup = function()
{
  tempoCount = Math.floor(waac.sampleRate / TEMPO);

  for (var i = 0; i < REVERB_BUFFER_SIZE; i++)
  {
    reverbBufferL[i] = 0;
    reverbBufferR[i] = 0;
  }

  for (var i = 0; i < SCALE_BUFFER_SIZE; i++)
  {
    scaleTable[i] = Math.floor(Math.pow(2.0, i / 12.0) * 440.0 * (0x100000000 / waac.sampleRate / WAVE_BUFFER_SIZE));
  }

  for (var i = 0; i < WAVE_BUFFER_SIZE; i++)
  {
    waveData[i] = Math.floor(Math.sin(Math.PI * 2.0 / WAVE_BUFFER_SIZE * i) * FIXED_SCALE)
  }

  for (var i = 0; i < OSCS; i++)
  {
    seqData[i] = [];
    params[i] = new Param();
    for (var j = 0; j < SEQ_LENGTH; j++)
    {
      seqData[i][j] = new NoteData();
    }

    params[i].state = STATE_SLEEP;
    params[i].envelopeLevelA = CONST03;
    params[i].envelopeLevelS = 0;
    params[i].envelopeDiffA = CONST03 >> 3;
    params[i].envelopeDiffD = (0 - CONST03) >> 15;
    params[i].envelopeDiffR = (0 - CONST03) >> 13;
    params[i].levelL = CONST05;
    params[i].levelR = CONST05;
    params[i].levelRev = REVERB_VOLUME;
    params[i].mixOut = true;
    params[i].modPatch0 = i;
    params[i].modPatch1 = i;
    params[i].modLevel0 = FIXED_SCALE * rand(4);
    params[i].modLevel1 = 0;
  }
  params[0].levelL = CONST05 >> 1;
  params[0].levelR = CONST05;
  params[1].levelL = CONST05;
  params[1].levelR = CONST05 >> 1;

  counter = 0;
  seqCounter = 0;
  barCounter = 0;
  deleteCounter = 0;
  chord = 0;
  note = 0;
  sc = 0;
  reverbAddrL = 0;
  reverbAddrR = 0;
  reverbCounter = 0;
};

var loop = function()
{
  // sequencer
  counter++;
  if (counter > tempoCount)
  {
    counter = 0;
    if (seqCounter >= SEQ_LENGTH)
    {
      seqCounter = 0;
      if ((barCounter & 3) == 0)
      {
        for (var i = 0; i < OSCS; i++)
        {
          params[i].envelopeDiffA = CONST03 >> (rand(11) + 2);
          params[i].modLevel0 = FIXED_SCALE * rand(4);
        }
        if (chord == 5)
        {
          chord = rand(3);
        }
        else
        {
          chord = rand(CHORDS);
        }
        deleteCounter = rand(16);
      }
      for (var i = 0; i < deleteCounter; i++)
      {
        seqData[rand(OSCS)][rand(SEQ_LENGTH)].oct = 0;
      }
      for (var i = 0; i < 4; i++)
      {
        var ch = rand(OSCS);
        seqData[ch][rand(SEQ_LENGTH)].note = rand(CHORD_LENGTH);
        seqData[ch][rand(SEQ_LENGTH)].oct = rand(3) + 5;
      }
      barCounter++;
    }
    for (var i = 0; i < OSCS; i++)
    {
      if (seqData[i][seqCounter].oct != 0)
      {
        params[i].noteOn = true;
        var n = chordData[chord][seqData[i][seqCounter].note];
        params[i].pitch = scaleTable[n] << seqData[i][seqCounter].oct;
      }
      else
      {
        params[i].noteOn = false;
      }
    }
    seqCounter++;
  }

  synth();

  // mixing
  var mixL = 0;
  var mixR = 0;
  var mixRevL = 0;
  var mixRevR = 0;
  for (var i = 0; i < OSCS; i++)
  {
    mixL += params[i].outWaveL;
    mixR += params[i].outWaveR;
    mixRevL += params[i].outRevL;
    mixRevR += params[i].outRevR;
  }

  // reverb
  var reverbL = reverbBufferR[reverbAddrR] >> 1;
  var reverbR = reverbBufferL[reverbAddrL] >> 1;
  reverbL += mixRevR;
  reverbR += mixRevL;
  reverbBufferL[reverbAddrL] = reverbL;
  reverbBufferR[reverbAddrR] = reverbR;
  reverbAddrL++;
  if (reverbAddrL > REVERB_L_SIZE)
  {
    reverbAddrL = 0;
  }
  reverbAddrR++;
  if (reverbAddrR > REVERB_R_SIZE)
  {
    reverbAddrR = 0;
  }
  outL = (mixL + reverbBufferL[reverbAddrL]) * OUT_VOLUME;
  outR = (mixR + reverbBufferR[reverbAddrR]) * OUT_VOLUME;
};

function sp_process(ev)
{
  var bufL = ev.outputBuffer.getChannelData(0);
  var bufR = ev.outputBuffer.getChannelData(1);
  for (var i = 0; i < BUFFER_LENGTH; i++)
  {
    loop();
    bufL[i] = outL;
    bufR[i] = outR;
  }
}

var start = function()
{
  if (wasp)
  {
    wasp.disconnect();
  }
  waac = new AudioContext();
  setup();
  wasp = waac.createScriptProcessor(BUFFER_LENGTH, 2, 2);
  wasp.onaudioprocess = sp_process;
  wasp.connect(waac.destination);
}

