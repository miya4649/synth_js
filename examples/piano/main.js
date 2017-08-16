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

function SynthCommand(osc_arg, noteOn_arg, note_arg, oct_arg)
{
  this.osc = osc_arg;
  this.noteOn = noteOn_arg;
  this.note = note_arg;
  this.oct = oct_arg;
}

function Main()
{
  var self = this;
  var FIXED_BITS = 14;
  var FIXED_BITS_ENV = 8;
  var FIXED_SCALE = (1 << FIXED_BITS);
  var ENV_VALUE_MAX = (1 << FIXED_BITS << FIXED_BITS_ENV);
  var KEYS = 29;

  var synth = new Synthesizer();
  var command = new Fifo();
  var scaleBufferSize = 16;
  var scaleTable = [];
  var toneDetune = [];
  var toneOct = [];
  var bufferSize = 0;
  var operators = 1;

  var noteData = {
    z: {n:0, o:0},
    s: {n:1, o:0},
    x: {n:2, o:0},
    d: {n:3, o:0},
    c: {n:4, o:0},
    v: {n:5, o:0},
    g: {n:6, o:0},
    b: {n:7, o:0},
    h: {n:8, o:0},
    n: {n:9, o:0},
    j: {n:10, o:0},
    m: {n:11, o:0},
    q: {n:0, o:1},
    2: {n:1, o:1},
    w: {n:2, o:1},
    3: {n:3, o:1},
    e: {n:4, o:1},
    r: {n:5, o:1},
    5: {n:6, o:1},
    t: {n:7, o:1},
    6: {n:8, o:1},
    y: {n:9, o:1},
    7: {n:10, o:1},
    u: {n:11, o:1},
    i: {n:0, o:2},
    9: {n:1, o:2},
    o: {n:2, o:2},
    0: {n:3, o:2},
    p: {n:4, o:2}
  };

  // callback
  var processCommand = function(delaySamples)
  {
    while (true)
    {
      var i;
      var c = command.pop();
      var ch, note;
      if (c !== undefined)
      {
        for (i = 0; i < operators; i++)
        {
          ch = c.note + 12 * c.oct + i * KEYS;
          synth.getParams(ch).pitch = scaleTable[c.note] * (1 << (c.oct + toneOct[i])) + toneDetune[i];
          synth.getParams(ch).noteOn = c.noteOn;
          synth.setActiveCh(ch, true);
        }
      }
      else
      {
        break;
      }
    }
  };

  this.playBrass = function()
  {
    var i, j, k;
    var MOD_LEVEL_MAX = (Math.floor(FIXED_SCALE * 0.52));
    var REVERB_VOLUME = (Math.floor(FIXED_SCALE * 0.3));
    var OUT_VOLUME = (1.0 / FIXED_SCALE);
    var DEFAULT_LEVEL = (Math.floor(FIXED_SCALE / 6));
    operators = 2;
    var oscs = KEYS * operators;
    self.stop();
    init();
    command.init(256);
    synth.setSynthParam(oscs, 0.278639455782, 0.136533333333, REVERB_VOLUME, 0.5, OUT_VOLUME, bufferSize);
    synth.init();
    for (i = 0; i < KEYS; i++)
    {
      k = i;
      synth.getParams(k).envelopeLevelA = ENV_VALUE_MAX;
      synth.getParams(k).envelopeLevelS = ENV_VALUE_MAX;
      synth.getParams(k).envelopeDiffA = ENV_VALUE_MAX >> 9;
      synth.getParams(k).envelopeDiffD = (- ENV_VALUE_MAX) >> 18;
      synth.getParams(k).envelopeDiffR = (- ENV_VALUE_MAX) >> 12;
      synth.getParams(k).modLevel0 = MOD_LEVEL_MAX * 12;
      synth.getParams(k).modPatch0 = k + KEYS;
      synth.getParams(k).levelL = DEFAULT_LEVEL;
      synth.getParams(k).levelR = DEFAULT_LEVEL;
      synth.getParams(k).mixOut = true;
      k = i + KEYS;
      synth.getParams(k).envelopeLevelA = ENV_VALUE_MAX;
      synth.getParams(k).envelopeLevelS = Math.floor(ENV_VALUE_MAX * 0.5);
      synth.getParams(k).envelopeDiffA = ENV_VALUE_MAX >> 10;
      synth.getParams(k).envelopeDiffD = (- ENV_VALUE_MAX) >> 18;
      synth.getParams(k).envelopeDiffR = (- ENV_VALUE_MAX) >> 13;
      synth.getParams(k).modLevel0 = MOD_LEVEL_MAX * 5;
      synth.getParams(k).modPatch0 = k;
      synth.getParams(k).levelL = DEFAULT_LEVEL;
      synth.getParams(k).levelR = DEFAULT_LEVEL;
      synth.getParams(k).mixOut = false;
    }
    synth.setCallbackRate(bufferSize);
    synth.setCallback(processCommand);
    toneOct = [6, 6];
    for (i = 0; i < operators; i++)
    {
      toneDetune[i] = 0xffffffff / synth.getSampleRate() * (i * 2.0);
    }
    synth.start();
  };

  this.stop = function()
  {
    window.removeEventListener('keyup', evKeyUp);
    window.removeEventListener('keydown', evKeyDown);
    window.removeEventListener('click', evClick);
    synth.stop();
  };

  this.playOrgan = function()
  {
    var i, j, k;
    var MOD_LEVEL_MAX = (Math.floor(FIXED_SCALE * 0.52));
    var REVERB_VOLUME = (Math.floor(FIXED_SCALE * 0.3));
    var OUT_VOLUME = (1.0 / FIXED_SCALE);
    var DEFAULT_LEVEL = (Math.floor(FIXED_SCALE / 18));
    operators = 4;
    var oscs = KEYS * operators;
    self.stop();
    init();
    command.init(256);
    synth.setSynthParam(oscs, 0.278639455782, 0.136533333333, REVERB_VOLUME, 0.7, OUT_VOLUME, bufferSize);
    synth.init();
    for (i = 0; i < oscs; i++)
    {
      k = i;
      synth.getParams(k).envelopeLevelA = ENV_VALUE_MAX;
      synth.getParams(k).envelopeLevelS = ENV_VALUE_MAX;
      synth.getParams(k).envelopeDiffA = ENV_VALUE_MAX >> 9;
      synth.getParams(k).envelopeDiffD = (- ENV_VALUE_MAX) >> 12;
      synth.getParams(k).envelopeDiffR = (- ENV_VALUE_MAX) >> 12;
      synth.getParams(k).modLevel0 = MOD_LEVEL_MAX * 6;
      synth.getParams(k).modPatch0 = k;
      synth.getParams(k).levelL = DEFAULT_LEVEL;
      synth.getParams(k).levelR = DEFAULT_LEVEL;
      synth.getParams(k).mixOut = true;
    }
    synth.setCallbackRate(bufferSize);
    synth.setCallback(processCommand);
    for (i = 0; i < operators; i++)
    {
      toneOct[i] = 5 + i;
      toneDetune[i] = 0xffffffff / synth.getSampleRate() * (i * 1.234567);
    }
    synth.start();
  };

  this.playPiano = function()
  {
    var i, j, k;
    var MOD_LEVEL_MAX = (Math.floor(FIXED_SCALE * 0.52));
    var REVERB_VOLUME = (Math.floor(FIXED_SCALE * 0.3));
    var OUT_VOLUME = (1.0 / FIXED_SCALE);
    var DEFAULT_LEVEL = (Math.floor(FIXED_SCALE / 10));
    operators = 2;
    var oscs = KEYS * operators;
    self.stop();
    init();
    command.init(256);
    synth.setSynthParam(oscs, 0.278639455782, 0.136533333333, REVERB_VOLUME, 0.5, OUT_VOLUME, bufferSize);
    synth.init();
    for (i = 0; i < oscs; i++)
    {
      k = i;
      synth.getParams(k).envelopeLevelA = ENV_VALUE_MAX;
      synth.getParams(k).envelopeLevelS = 0;
      synth.getParams(k).envelopeDiffA = ENV_VALUE_MAX >> 5;
      synth.getParams(k).envelopeDiffD = (- ENV_VALUE_MAX) >> 18;
      synth.getParams(k).envelopeDiffR = (- ENV_VALUE_MAX) >> 14;
      synth.getParams(k).modLevel0 = MOD_LEVEL_MAX * 2;
      synth.getParams(k).modPatch0 = k;
      synth.getParams(k).levelL = DEFAULT_LEVEL;
      synth.getParams(k).levelR = DEFAULT_LEVEL;
      synth.getParams(k).mixOut = true;
    }
    synth.setCallbackRate(bufferSize);
    synth.setCallback(processCommand);
    for (i = 0; i < operators; i++)
    {
      toneOct[i] = 7;
      toneDetune[i] = 0xffffffff / synth.getSampleRate() * (i * 0.5);
    }
    synth.start();
  };

  this.stop = function()
  {
    window.removeEventListener('keyup', evKeyUp);
    window.removeEventListener('keydown', evKeyDown);
    window.removeEventListener('click', evClick);
    synth.stop();
  };

  this.setBufferSize = function(value)
  {
    bufferSize = value;
  };

  var init = function()
  {
    var i;
    for (i = 0; i < scaleBufferSize; i++)
    {
      scaleTable[i] = Math.floor(Math.pow(2.0, i / 12.0) * 523.2511306011972 * (0x100000000 / synth.getSampleRate() / synth.getWaveBufferSize()));
    }

    window.addEventListener('keyup', evKeyUp);
    window.addEventListener('keydown', evKeyDown);
    window.addEventListener('click', evClick);
  };

  var evKeyUp = function(ev)
  {
    if ((ev.key === 'Escape') || (ev.key === 'Esc'))
    {
      self.stop();
    }
    var n = noteData[ev.key];
    if (n)
    {
      command.push(new SynthCommand(n.n, false, n.n, n.o));
    }
  };

  var evKeyDown = function(ev)
  {
    var n = noteData[ev.key];
    if (n)
    {
      command.push(new SynthCommand(n.n, true, n.n, n.o));
    }
  };

  var evClick = function(ev)
  {
  };
}

var main = new Main();
