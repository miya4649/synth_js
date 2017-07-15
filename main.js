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

function Main()
{
  var FIXED_BITS = 14;
  var FIXED_BITS_ENV = 8;
  var FIXED_SCALE = (1 << FIXED_BITS);
  var ENV_VALUE_MAX = (1 << FIXED_BITS << FIXED_BITS_ENV);
  var VSPEED = 0.001;
  var OBJECTS = 32;

  var seq = new Sequencer();
  var visualizer = new Visualizer();

  this.stop = function()
  {
    seq.stop();
  };

  // callback
  var noteOnCallback = function(data)
  {
    visualizer.fifo.push(data);
  };

  this.playMonologue = function()
  {
    var i;
    var OSCS = 4;
    var TEMPO = 6.0;
    var PART_VOLUME = (Math.floor(FIXED_SCALE / OSCS));
    var MOD_LEVEL_MAX = (Math.floor(FIXED_SCALE * 0.52));
    var REVERB_VOLUME = (Math.floor(FIXED_SCALE * 0.3));
    var OUT_VOLUME = (1.0 / FIXED_SCALE);
    var chordData = [
      [0,2,4,7,11,0,0,0],
      [2,4,5,7,11,0,0,0],
      [0,4,7,9,11,0,0,0],
      [0,4,5,7,9,0,0,0],
      [0,2,4,5,9,0,0,0],
      [2,5,7,9,11,0,0,0]
    ];
    var progressionData = [
      [0, 6],
      [0, 6],
      [0, 6],
      [0, 6],
      [0, 6],
      [0, 3]
    ];
    var bassData = [0,1,3,2,1,2];
    document.body.innerHTML = '<canvas id="canvas1"></canvas>';
    stop();
    seq.setSeqParam(TEMPO, 16, 4, 5, 3, 16, 4, true, false);
    seq.setChordData(5, chordData, progressionData, bassData);
    seq.synth.setSynthParam(OSCS, 0.278639455782, 0.136533333333, REVERB_VOLUME, 0.5, OUT_VOLUME);
    seq.setCallback(noteOnCallback);
    seq.init();
    visualizer.init(OBJECTS, TEMPO * VSPEED);
    for (i = 0; i < OSCS; i++)
    {
      seq.synth.getParams(i).envelopeDiffA = ENV_VALUE_MAX >> 3;
      seq.synth.getParams(i).envelopeDiffD = (- ENV_VALUE_MAX) >> 15;
      seq.synth.getParams(i).envelopeDiffR = (- ENV_VALUE_MAX) >> 13;
      seq.synth.getParams(i).modLevel0 = MOD_LEVEL_MAX;
    }
    seq.synth.getParams(0).levelL = PART_VOLUME >> 1;
    seq.synth.getParams(0).levelR = PART_VOLUME;
    seq.synth.getParams(1).levelL = PART_VOLUME;
    seq.synth.getParams(1).levelR = PART_VOLUME >> 1;
    seq.start();
  };

  this.playLuna = function()
  {
    var i;
    var OSCS = 4;
    var TEMPO = 1.0;
    var PART_VOLUME = (Math.floor(FIXED_SCALE / OSCS));
    var MOD_LEVEL_MAX = (Math.floor(FIXED_SCALE * 0.3));
    var REVERB_VOLUME = (Math.floor(FIXED_SCALE * 0.3));
    var OUT_VOLUME = (1.0 / FIXED_SCALE);
    var chordData = [
      [0,2,4,5,7,0,0,0],
      [0,2,5,7,9,0,0,0],
      [0,2,5,7,11,0,0,0]
    ];
    var progressionData = [
      [0, 3],
      [0, 3],
      [0, 1]
    ];
    var bassData = [0,2,3];
    document.body.innerHTML = '<canvas id="canvas1"></canvas>';
    stop();
    seq.setSeqParam(TEMPO, 8, 8, 6, 3, 16, 4, false, true);
    seq.setChordData(5, chordData, progressionData, bassData);
    seq.synth.setSynthParam(OSCS, 0.557278911565, 0.519439673469, REVERB_VOLUME, 0.8, OUT_VOLUME);
    seq.setCallback(noteOnCallback);
    seq.init();
    visualizer.init(OBJECTS, TEMPO * VSPEED);
    for (i = 0; i < OSCS; i++)
    {
      seq.synth.getParams(i).envelopeDiffA = ENV_VALUE_MAX >> 7;
      seq.synth.getParams(i).envelopeDiffD = (- ENV_VALUE_MAX) >> 17;
      seq.synth.getParams(i).envelopeDiffR = (- ENV_VALUE_MAX) >> 15;
      seq.synth.getParams(i).modLevel0 = MOD_LEVEL_MAX;
    }
    seq.synth.getParams(0).levelL = PART_VOLUME >> 1;
    seq.synth.getParams(0).levelR = PART_VOLUME;
    seq.synth.getParams(1).levelL = PART_VOLUME;
    seq.synth.getParams(1).levelR = PART_VOLUME >> 1;
    seq.start();
  };

  this.playIntoxication = function()
  {
    var i;
    var OSCS = 4;
    var TEMPO = 5.0;
    var PART_VOLUME = (Math.floor(FIXED_SCALE / OSCS));
    var MOD_LEVEL_MAX = (Math.floor(FIXED_SCALE * 0.52));
    var REVERB_VOLUME = (Math.floor(FIXED_SCALE * 0.3));
    var OUT_VOLUME = (1.0 / FIXED_SCALE);
    var chordData = [
      [0,4,7,0,0,0,0,0],
      [4,7,11,0,0,0,0,0],
      [0,4,9,0,0,0,0,0],
      [0,5,9,0,0,0,0,0],
      [2,5,9,0,0,0,0,0],
      [2,7,11,0,0,0,0,0]
    ];
    var progressionData = [
      [0, 6],
      [0, 6],
      [0, 6],
      [0, 6],
      [0, 6],
      [0, 3]
    ];
    var bassData = [0,0,2,1,0,1];
    document.body.innerHTML = '<canvas id="canvas1"></canvas>';
    stop();
    seq.setSeqParam(TEMPO, 6, 3, 5, 3, 16, 8, true, true);
    seq.setChordData(3, chordData, progressionData, bassData);
    seq.synth.setSynthParam(OSCS, 0.4, 0.8123, REVERB_VOLUME, 0.8, OUT_VOLUME);
    seq.setCallback(noteOnCallback);
    seq.init();
    visualizer.init(OBJECTS, TEMPO * VSPEED);
    for (i = 0; i < OSCS; i++)
    {
      seq.synth.getParams(i).envelopeDiffA = ENV_VALUE_MAX >> 3;
      seq.synth.getParams(i).envelopeDiffD = (- ENV_VALUE_MAX) >> 15;
      seq.synth.getParams(i).envelopeDiffR = (- ENV_VALUE_MAX) >> 13;
      seq.synth.getParams(i).modLevel0 = MOD_LEVEL_MAX * randI(6);
    }
    seq.synth.getParams(0).levelL = PART_VOLUME >> 1;
    seq.synth.getParams(0).levelR = PART_VOLUME;
    seq.synth.getParams(1).levelL = PART_VOLUME;
    seq.synth.getParams(1).levelR = PART_VOLUME >> 1;
    seq.start();
  };
}

var main = new Main();
