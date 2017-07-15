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

function DataSeq(satz, ch, chord, note, oct)
{
  this.satz = satz;
  this.ch = ch;
  this.chord = chord;
  this.note = note;
  this.oct = oct;
}

function Sequencer()
{
  var self = this;
  var tempo = 5.0;
  var seqLength = 8;
  var bassFrequency = 2;
  var scaleBufferSize = 16;
  var seqCounter = 0;
  var barCounter = 0;
  var satzCounter = 0;
  var deleteCounter = 0;
  var chord = 0;
  var note = 0;
  var octMin = 5;
  var octRange = 3;
  var deleteFrequency = 16;
  var repeat = 4;
  var toneChange = true;
  var appendBass = true;
  var tempoCount = 0;
  var scaleTable = [];
  var chordLength = 3;
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
  var seqData = [];

  this.synth = new Synthesizer();

  // default callback
  var dummy = function()
  {
  };
  var callbackNoteOn = dummy;

  function NoteData()
  {
    this.note = 0;
    this.oct = 0;
  }

  this.stop = function()
  {
    if (this.synth)
    {
      this.synth.stop();
    }
  };

  this.init = function()
  {
    var i, j;
    this.synth.init();
    tempoCount = Math.floor(this.synth.getSampleRate() / tempo);

    for (i = 0; i < scaleBufferSize; i++)
    {
      scaleTable[i] = Math.floor(Math.pow(2.0, i / 12.0) * 440.0 * (0x100000000 / this.synth.getSampleRate() / this.synth.getWaveBufferSize()));
    }

    for (i = 0; i < this.synth.getOscs(); i++)
    {
      seqData[i] = [];
      for (j = 0; j < seqLength; j++)
      {
        seqData[i][j] = new NoteData();
      }
    }
  };

  this.start = function()
  {
    seqCounter = 0;
    barCounter = 0;
    deleteCounter = 0;
    chord = 0;
    note = 0;

    this.synth.setCallback(loop);
    this.synth.setCallbackRate(tempoCount);
    this.synth.start();
  };

  // callback
  var loop = function()
  {
    // sequencer
    var i, ch, beat, n, mixL, mixR, mixRevL, mixRevR, reverbL, reverbR;
    var oscs = self.synth.getOscs();

    if (seqCounter >= seqLength)
    {
      seqCounter = 0;
      if (barCounter >= repeat)
      {
        barCounter = 0;
        if (toneChange === true)
        {
          for (i = 0; i < oscs; i++)
          {
            self.synth.getParams(i).envelopeDiffA = self.synth.getEnvValueMax() >> (randI(11) + 2);
            self.synth.getParams(i).modLevel0 = self.synth.getModLevelMax() * randI(6);
          }
        }
        chord = randI(progressionData[chord][1]) + progressionData[chord][0];
        deleteCounter = randI(deleteFrequency);
        satzCounter++;
      }
      for (i = 0; i < deleteCounter; i++)
      {
        seqData[randI(oscs)][randI(seqLength)].oct = 0;
      }
      for (i = 0; i < 4; i++)
      {
        ch = randI(oscs);
        beat = randI(seqLength);
        beat_prev = beat - 1;
        if (beat_prev < 0)
        {
          beat_prev += seqLength;
        }
        seqData[ch][beat].note = randI(chordLength);
        seqData[ch][beat].oct = randI(octRange) + octMin;
        seqData[ch][beat_prev].oct = 0;
      }
      if (appendBass === true)
      {
        for (i = 0; i < seqLength; i+=bassFrequency)
        {
          seqData[0][i].note = bassData[chord];
          seqData[0][i].oct = octMin;
        }
      }
      barCounter++;
    }
    for (i = 0; i < oscs; i++)
    {
      if (seqData[i][seqCounter].oct !== 0)
      {
        n = chordData[chord][seqData[i][seqCounter].note];
        self.synth.getParams(i).pitch = scaleTable[n] << seqData[i][seqCounter].oct;
        self.synth.getParams(i).noteOn = true;
        callbackNoteOn(new DataSeq(satzCounter, i, chord, n, seqData[i][seqCounter].oct));
      }
      else
      {
        self.synth.getParams(i).noteOn = false;
      }
    }
    seqCounter++;
  };

  this.setSeqParam = function(tempo_arg, seqLength_arg, bassFrequency_arg, octMin_arg, octRange_arg, deleteFrequency_arg, repeat_arg, toneChange_arg, appendBass_arg)
  {
    tempo = tempo_arg;
    seqLength = seqLength_arg;
    bassFrequency = bassFrequency_arg;
    octMin = octMin_arg;
    octRange = octRange_arg;
    deleteFrequency = deleteFrequency_arg;
    repeat = repeat_arg;
    toneChange = toneChange_arg;
    appendBass = appendBass_arg;
  };

  this.setChordData = function(chordLength_arg, chordData_arg, progressionData_arg, bassData_arg)
  {
    chordLength = chordLength_arg;
    chordData = chordData_arg;
    progressionData = progressionData_arg;
    bassData = bassData_arg;
  };

  this.setCallback = function(callbackNoteOn_arg)
  {
    callbackNoteOn = callbackNoteOn_arg;
  };
}
