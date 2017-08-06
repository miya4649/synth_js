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

function Sprite()
{
  var self = this;
  this.x = 0;
  this.y = 0;
  this.age = 1.0;
  this.size = 24;
  this.text = '';
  this.speed = 0.01;
}

function Visualizer()
{
  var self = this;
  var canvas = new CanvasLib();
  var objects = 0;
  var time = 0.0;
  var objPtr = 0;
  var speed = 0.01;
  var masterSeed = randI(0xffffffff);
  var playing = false;
  var sprites = [];
  var poem = [];
  var poemPtr = 0;

  this.fifo = new Fifo();
  this.randf = new RandF();

  // callback sub
  var addObj = function(data)
  {
    var i;
    self.randf.seed((data.ch << 24) ^ (data.satz << 20) ^ (data.chord << 16) ^ (data.note << 8) ^ data.oct ^ masterSeed);
    if (sprites[objPtr].age >= 1.0)
    {
      sprites[objPtr].age = 0.0;
      sprites[objPtr].text = poem[poemPtr].text;
      sprites[objPtr].x = Math.floor(canvas.getWidth() * 0.5);
      sprites[objPtr].y = Math.floor(canvas.getHeight() * 0.5);
      sprites[objPtr].size = Math.floor(poem[poemPtr].emphasis * canvas.getWidth() * 0.03);
      sprites[objPtr].speed = 0.05 / poem[poemPtr].text.length / poem[poemPtr].emphasis;
      objPtr++;
      if (objPtr >= objects)
      {
        objPtr = 0;
      }

      poemPtr++;
      if (poemPtr >= poem.length)
      {
        poemPtr = 0;
      }
    }
  };

  // callback
  var draw = function()
  {
    var i, peek, data, col, size;
    var timeNow = Date.now();
    while (true)
    {
      peek = self.fifo.peek();
      if (peek === undefined)
      {
        break;
      }
      else if (peek.delay > timeNow)
      {
        break;
      }
      data = self.fifo.pop();
      if (data === undefined)
      {
        break;
      }
      addObj(data);
    }
    time += speed;
    if (playing === true)
    {
      canvas.clearScreen();
      for (i = 0; i < objects; i++)
      {
        if (sprites[i].age < 1.0)
        {
          col = Math.floor(255 * (1.0 - sprites[i].age));
          size = sprites[i].size + 'pt serif';
          canvas.drawText(sprites[i].text, sprites[i].x, sprites[i].y, size, 'rgb('+col+','+col+','+col+')');
          sprites[i].age += sprites[i].speed;
        }
      }
      canvas.nextFrame();
    }
  };

  this.init = function(objects_arg, speed_arg, poem_arg)
  {
    var i;
    time = 0.0;
    objPtr = 0;
    poemPtr = 0;
    objects = objects_arg;
    speed = speed_arg;
    poem = poem_arg;
    self.fifo.init(objects * 16);
    canvas.init('canvas1', draw);
    sprites = [];
    for (i = 0; i < objects; i++)
    {
      sprites[i] = new Sprite();
    }
  };

  this.start = function()
  {
    playing = true;
    draw();
  };

  this.stop = function()
  {
    playing = false;
    canvas.close();
  };
}
