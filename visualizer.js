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

function Visualizer()
{
  var vs_s =
      "uniform float time;\n" +
      "uniform float dir;\n" +
      "attribute vec2 pos_s;\n" +
      "attribute vec2 pos_e;\n" +
      "attribute vec3 col;\n" +
      "attribute float otime;\n" +
      "varying vec4 fcol;\n" +
      "void main(void)\n" +
      "{\n" +
      " vec2 d2 = vec2(dir, 1.0);\n" +
      " float t1 = clamp(otime - time, 0.0, 1.0);\n" +
      " vec2 p1 = mix(pos_s * d2, pos_e * d2, vec2(t1, t1));\n" +
      " gl_Position = vec4(p1, 0.0, 1.0);\n" +
      " vec3 c1 = mix(vec3(0.0, 0.0, 0.0), col, vec3(t1, t1, t1));\n" +
      " fcol = vec4(c1, 1.0);\n" +
      "}\n";

  var fs_s =
      "precision mediump float;\n" +
      "varying vec4 fcol;\n" +
      "void main(void)\n" +
      "{\n" +
      " gl_FragColor = fcol;\n" +
      "}\n";

  var self = this;
  var webgl;
  var sprog;
  var vbo_pos_s;
  var vbo_pos_e;
  var vbo_col;
  var vbo_otime;
  var objects = 0;
  var time = 0.0;
  var vdata_pos_s = [];
  var vdata_pos_e = [];
  var vdata_col = [];
  var vdata_otime = [];
  var obj_ptr = 0;
  var speed = 0.01;
  var master_seed = randI(0xffffffff);

  this.fifo = new Fifo();
  this.randf = new RandF();

  // callback sub
  var addObj = function(data)
  {
    var i, j, k;
    var pos_s = [];
    var pos_e = [];
    var col = [];
    var otime = [];
    self.randf.seed((data.ch << 24) ^ (data.satz << 20) ^ (data.chord << 16) ^ (data.note << 8) ^ data.oct ^ master_seed);
    var x = self.randf.get() * 2.0 - 1.0;
    var y = self.randf.get() * 2.0 - 1.0;
    var r = self.randf.get();
    var g = self.randf.get();
    var b = self.randf.get();
    for (i = 0; i < 3; i++)
    {
      pos_s.push(x + self.randf.get() - 0.5);
      pos_s.push(y + self.randf.get() - 0.5);
      pos_e.push(x + self.randf.get() - 0.5);
      pos_e.push(y + self.randf.get() - 0.5);
      col.push(r);
      col.push(g);
      col.push(b);
      otime.push(time + 1.0);
    }
    webgl.updateBuffer(vbo_pos_s, pos_s, obj_ptr * 6);
    webgl.updateBuffer(vbo_pos_e, pos_e, obj_ptr * 6);
    webgl.updateBuffer(vbo_col, col, obj_ptr * 9);
    webgl.updateBuffer(vbo_otime, otime, obj_ptr * 3);
    obj_ptr++;
    if (obj_ptr >= objects)
    {
      obj_ptr = 0;
    }
  };

  // callback
  var draw = function()
  {
    var i;
    while (true)
    {
      var data = self.fifo.pop();
      if (data === undefined)
      {
        break;
      }
      addObj(data);
    }
    webgl.clearScreen();
    webgl.uniform1f(sprog, 'time', time);
    webgl.uniform1f(sprog, 'dir', 1.0);
    webgl.drawTriangles(0, objects * 3);
    webgl.uniform1f(sprog, 'dir', -1.0);
    webgl.drawTriangles(0, objects * 3);
    time += speed;
    webgl.nextFrame();
  };

  this.init = function(objects_arg, speed_arg)
  {
    var i, j, k;
    objects = objects_arg;
    speed = speed_arg;
    this.fifo.init(objects);
    webgl = new WebGLLib();
    webgl.init('canvas1', draw);
    sprog = webgl.createProgram(vs_s, fs_s);
    webgl.useProgram(sprog);

    for (i = 0; i < objects; i++)
    {
      for (k = 0; k < 3; k++)
      {
        for (j = 0; j < 2; j++)
        {
          vdata_pos_s.push(0.0);
          vdata_pos_e.push(0.0);
        }
        for (j = 0; j < 3; j++)
        {
          vdata_col.push(0.0);
        }
        vdata_otime.push(0.0);
      }
    }

    vbo_pos_s = webgl.createBuffer(sprog, 'pos_s', vdata_pos_s, 2, true);
    vbo_pos_e = webgl.createBuffer(sprog, 'pos_e', vdata_pos_e, 2, true);
    vbo_col = webgl.createBuffer(sprog, 'col', vdata_col, 3, true);
    vbo_otime = webgl.createBuffer(sprog, 'otime', vdata_otime, 1, true);

    webgl.setBlendMode(1);
    draw();
  };

}
