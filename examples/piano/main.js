/*
  Copyright (c) 2017-2019, miya
  All rights reserved.

  Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

  1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

  2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
  IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

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
  var randf = new RandF();
  var scaleBufferSize = 16;
  var scaleTable = [];
  var toneDetune = [];
  var toneOct = [];
  var toneScale = [];
  var bufferSize = 0;
  var operators = 1;
  var keyStatus = [];

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

  this.stop = function()
  {
    window.removeEventListener('keyup', evKeyUp);
    window.removeEventListener('keydown', evKeyDown);
    window.removeEventListener('click', evClick);
    synth.stop();
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
    command.init(256);
    synth.setSynthParam(oscs, 0.278639455782, 0.136533333333, REVERB_VOLUME, 0.5, OUT_VOLUME, bufferSize);
    synth.init();
    init();
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
    toneOct = [6, 6];
    for (i = 0; i < operators; i++)
    {
      toneDetune[i] = 0xffffffff / synth.getSampleRate() * (i * 2.0);
      toneScale[i] = 1.0;
    }
    synth.start();
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
    command.init(256);
    synth.setSynthParam(oscs, 0.278639455782, 0.136533333333, REVERB_VOLUME, 0.7, OUT_VOLUME, bufferSize);
    synth.init();
    init();
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
    for (i = 0; i < operators; i++)
    {
      toneOct[i] = 5 + i;
      toneDetune[i] = 0xffffffff / synth.getSampleRate() * (i * 1.234567);
      toneScale[i] = 1.0;
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
    command.init(256);
    synth.setSynthParam(oscs, 0.278639455782, 0.136533333333, REVERB_VOLUME, 0.5, OUT_VOLUME, bufferSize);
    synth.init();
    init();
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
    for (i = 0; i < operators; i++)
    {
      toneOct[i] = 7;
      toneDetune[i] = 0xffffffff / synth.getSampleRate() * (i * 0.5);
      toneScale[i] = 1.0;
    }
    synth.start();
  };

  this.playStrings = function()
  {
    var i, j, k;
    var MOD_LEVEL_MAX = (Math.floor(FIXED_SCALE * 0.52));
    var REVERB_VOLUME = (Math.floor(FIXED_SCALE * 0.3));
    var OUT_VOLUME = (1.0 / FIXED_SCALE);
    var DEFAULT_LEVEL = (Math.floor(FIXED_SCALE / 12));
    operators = 3;
    var oscs = KEYS * operators;
    self.stop();
    command.init(256);
    synth.setSynthParam(oscs, 0.278639455782, 0.136533333333, REVERB_VOLUME, 0.7, OUT_VOLUME, bufferSize);
    synth.init();
    init();
    for (i = 0; i < KEYS; i++)
    {
      for (j = 0; j < 2; j++)
      {
        k = i + j * KEYS;
        synth.getParams(k).envelopeLevelA = ENV_VALUE_MAX;
        synth.getParams(k).envelopeLevelS = Math.floor(ENV_VALUE_MAX * 0.9);
        synth.getParams(k).envelopeDiffA = ENV_VALUE_MAX >> 12;
        synth.getParams(k).envelopeDiffD = (- ENV_VALUE_MAX) >> 14;
        synth.getParams(k).envelopeDiffR = (- ENV_VALUE_MAX) >> 15;
        synth.getParams(k).modLevel0 = MOD_LEVEL_MAX * 7;
        synth.getParams(k).modPatch0 = k;
        synth.getParams(k).levelL = DEFAULT_LEVEL;
        synth.getParams(k).levelR = DEFAULT_LEVEL;
        synth.getParams(k).mixOut = true;
      }
      k = i + KEYS;
      synth.getParams(k).modLevel1 = Math.floor(MOD_LEVEL_MAX * 6);
      synth.getParams(k).modPatch1 = i + 2 * KEYS;
      k = i + 2 * KEYS;
      synth.getParams(k).envelopeLevelA = ENV_VALUE_MAX;
      synth.getParams(k).envelopeLevelS = ENV_VALUE_MAX;
      synth.getParams(k).envelopeDiffA = ENV_VALUE_MAX >> 13;
      synth.getParams(k).envelopeDiffD = (- ENV_VALUE_MAX) >> 13;
      synth.getParams(k).envelopeDiffR = (- ENV_VALUE_MAX) >> 13;
      synth.getParams(k).modLevel0 = 0;
      synth.getParams(k).modPatch0 = k;
      synth.getParams(k).levelL = DEFAULT_LEVEL;
      synth.getParams(k).levelR = DEFAULT_LEVEL;
      synth.getParams(k).mixOut = false;
    }
    for (i = 0; i < operators; i++)
    {
      toneOct[i] = 7;
    }
    toneDetune = [0, 0, (Math.floor(0xffffffff / synth.getSampleRate() * 3.0))];
    toneScale = [1.0, 1.0, 0.0];
    synth.start();
  };

  this.playElecOrgan = function()
  {
    var i, j, k;
    var MOD_LEVEL_MAX = (Math.floor(FIXED_SCALE * 0.52));
    var REVERB_VOLUME = (Math.floor(FIXED_SCALE * 0.3));
    var OUT_VOLUME = (1.0 / FIXED_SCALE);
    var DEFAULT_LEVEL = (Math.floor(FIXED_SCALE / 10));
    operators = 4;
    var oscs = KEYS * operators;
    self.stop();
    command.init(256);
    synth.setSynthParam(oscs, 0.278639455782, 0.136533333333, REVERB_VOLUME, 0.7, OUT_VOLUME, bufferSize);
    synth.init();
    init();
    for (j = 0; j < KEYS; j++)
    {
      for (i = 0; i < operators; i++)
      {
        k = i * KEYS + j;
        synth.getParams(k).envelopeLevelA = ENV_VALUE_MAX;
        synth.getParams(k).envelopeLevelS = ENV_VALUE_MAX * 0.8;
        synth.getParams(k).envelopeDiffA = ENV_VALUE_MAX >> 7;
        synth.getParams(k).envelopeDiffD = (- ENV_VALUE_MAX) >> 7;
        synth.getParams(k).envelopeDiffR = (- ENV_VALUE_MAX) >> 12;
        synth.getParams(k).modLevel0 = MOD_LEVEL_MAX << 1;
        synth.getParams(k).modPatch0 = k;
        synth.getParams(k).levelL = DEFAULT_LEVEL;
        synth.getParams(k).levelR = DEFAULT_LEVEL;
        synth.getParams(k).mixOut = true;
      }
      synth.getParams(0 * KEYS + j).modPatch0 = 1 * KEYS + j;
      synth.getParams(1 * KEYS + j).modPatch0 = 1 * KEYS + j;
      synth.getParams(2 * KEYS + j).modPatch0 = 3 * KEYS + j;
      synth.getParams(3 * KEYS + j).modPatch0 = 3 * KEYS + j;
      synth.getParams(1 * KEYS + j).mixOut = false;
      synth.getParams(3 * KEYS + j).mixOut = false;
      synth.getParams(1 * KEYS + j).modLevel0 = 0;
      synth.getParams(3 * KEYS + j).modLevel0 = 0;
    }
    for (i = 0; i < operators; i++)
    {
      toneOct[i] = 7;
      toneDetune[i] = 0xffffffff / synth.getSampleRate() * (i / 2.0);
      toneScale[i] = 1.0;
    }
    toneOct[1] = 6;
    toneOct[3] = 6;
    synth.start();
  };

  this.playCello = function()
  {
    var i, j, k;
    var MOD_LEVEL_MAX = (Math.floor(FIXED_SCALE * 0.52));
    var REVERB_VOLUME = (Math.floor(FIXED_SCALE * 0.3));
    var OUT_VOLUME = (1.0 / FIXED_SCALE);
    var DEFAULT_LEVEL = (Math.floor(FIXED_SCALE / 11));
    operators = 2;
    var oscs = KEYS * operators;
    self.stop();
    command.init(256);
    synth.setSynthParam(oscs, 0.278639455782, 0.136533333333, REVERB_VOLUME, 0.5, OUT_VOLUME, bufferSize);
    synth.init();
    init();
    for (i = 0; i < KEYS; i++)
    {
      synth.getParams(i).envelopeLevelA = ENV_VALUE_MAX;
      synth.getParams(i).envelopeLevelS = ENV_VALUE_MAX;
      synth.getParams(i).envelopeDiffA = ENV_VALUE_MAX >> 11;
      synth.getParams(i).envelopeDiffD = (- ENV_VALUE_MAX) >> 12;
      synth.getParams(i).envelopeDiffR = (- ENV_VALUE_MAX) >> 14;
      synth.getParams(i).modLevel0 = MOD_LEVEL_MAX * 5;
      synth.getParams(i).modPatch0 = i;
      synth.getParams(i).modLevel1 = MOD_LEVEL_MAX * 10;
      synth.getParams(i).modPatch1 = i + KEYS;
      synth.getParams(i).levelL = DEFAULT_LEVEL;
      synth.getParams(i).levelR = DEFAULT_LEVEL;
      synth.getParams(i).mixOut = true;
    }
    for (i = KEYS; i < KEYS * 2; i++)
    {
      synth.getParams(i).envelopeLevelA = ENV_VALUE_MAX;
      synth.getParams(i).envelopeLevelS = ENV_VALUE_MAX * 0.7;
      synth.getParams(i).envelopeDiffA = ENV_VALUE_MAX >> 5;
      synth.getParams(i).envelopeDiffD = (- ENV_VALUE_MAX) >> 17;
      synth.getParams(i).envelopeDiffR = (- ENV_VALUE_MAX) >> 14;
      synth.getParams(i).modLevel0 = MOD_LEVEL_MAX * 0;
      synth.getParams(i).modPatch0 = i;
      synth.getParams(i).modLevel1 = 0;
      synth.getParams(i).modPatch1 = i;
      synth.getParams(i).levelL = DEFAULT_LEVEL;
      synth.getParams(i).levelR = DEFAULT_LEVEL;
      synth.getParams(i).mixOut = false;
    }
    for (i = 0; i < operators; i++)
    {
      toneOct[i] = 5 + i * 2;
      toneDetune[i] = 0.0;
      toneScale[i] = 1.0;
    }
    synth.start();
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
    var i;
    if ((ev.key === 'Escape') || (ev.key === 'Esc'))
    {
      self.stop();
    }
    var n = noteData[ev.key];
    if (n)
    {
      for (i = 0; i < operators; i++)
      {
        var ch = n.n + 12 * n.o + i * KEYS;
        synth.playNote(ch, false);
      }
      keyStatus[ev.key] = false;
    }
  };

  var evKeyDown = function(ev)
  {
    var i, pitch;
    var n = noteData[ev.key];
    if (n)
    {
      if (keyStatus[ev.key] !== true)
      {
        for (i = 0; i < operators; i++)
        {
          var ch = n.n + 12 * n.o + i * KEYS;
          pitch = Math.floor(scaleTable[n.n] * (1 << (n.o + toneOct[i])) * toneScale[i] + toneDetune[i] * (randf.get() * 0.4 + 0.8));
          synth.getParams(ch).pitch = pitch;
          synth.playNote(ch, true);
        }
        keyStatus[ev.key] = true;
      }
    }
  };

  var evClick = function(ev)
  {
  };
}

var main = new Main();
