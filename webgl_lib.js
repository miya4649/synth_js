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

function WebGLLib()
{
  var canvas;
  var context;
  var gl;
  var width;
  var height;
  var callback;
  var resized = true;
  var averageTime = 16.666666;
  var fpsCounter = 0;
  var dateTime;

  var clearScreen = function()
  {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  };

  this.clearScreen = function()
  {
    clearScreen();
  };

  this.getWidth = function()
  {
    return width;
  };

  this.getHeight = function()
  {
    return height;
  };

  var delayResize = function()
  {
    if (resized === true)
    {
      resized = false;
      setTimeout(resize, 1000);
    }
  };

  var resize = function()
  {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    clearScreen();
    resized = true;
  };

  var createShader = function(source, type)
  {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
      console.log("Error: Create Shader");
      shader = null;
    }
    return shader;
  };

  this.nextFrame = function()
  {
    var now = Date.now();
    if (fpsCounter >= 60)
    {
      fpsCounter = 0;
      averageTime = (now - dateTime) * 0.0166666666667;
      dateTime = now;
    }
    fpsCounter++;
    window.requestAnimationFrame(callback);
  };

  this.drawTriangles = function(start, count)
  {
    gl.drawArrays(gl.TRIANGLES, start, count);
  };

  this.uniform1f = function(program, name, value)
  {
    gl.uniform1f(gl.getUniformLocation(program, name), value);
  };

  this.useProgram = function(pg_arg)
  {
    gl.useProgram(pg_arg);
  };

  this.createProgram = function(vs_source, fs_source)
  {
    var vs = createShader(vs_source, gl.VERTEX_SHADER);
    var fs = createShader(fs_source, gl.FRAGMENT_SHADER);
    var sprog = gl.createProgram();
    gl.attachShader(sprog, vs);
    gl.attachShader(sprog, fs);
    gl.linkProgram(sprog);

    if (!gl.getProgramParameter(sprog, gl.LINK_STATUS))
    {
      console.log("Error: Create Program");
      sprog = null;
    }
    return sprog;
  };

  this.setBlendMode = function(mode)
  {
    switch (mode)
    {
      case 0:
      gl.disable(gl.BLEND);
      break;
      case 1:
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
      gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
      break;
    }
  };

  this.createBuffer = function(program, name, array, size, isDynamic)
  {
    var usage;
    if (isDynamic)
    {
      usage = gl.DYNAMIC_DRAW;
    }
    else
    {
      usage = gl.STATIC_DRAW;
    }
    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), usage);
    var location = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vbo;
  };

  this.bindBuffer = function(buffer)
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  };

  this.updateBuffer = function(buffer, array, offset)
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, offset * 4, new Float32Array(array));
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  };

  this.deleteBuffer = function(buffer)
  {
    gl.deleteBuffer(buffer);
  };

  this.init = function(canvas_arg, callback_arg)
  {
    canvas = document.getElementById(canvas_arg);
    callback = callback_arg;
    fpsCounter = 0;
    dateTime = Date.now();

    if (canvas)
    {
      gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    }
    else
    {
      console.log("Error: Get Canvas");
    }

    if (gl)
    {
      resize();
      window.addEventListener('resize', delayResize);
    }
    else
    {
      console.log("Error: Get webgl");
    }
  };

  this.close = function()
  {
    window.removeEventListener('resize', delayResize);
  };

  this.getAverageTime = function()
  {
    return averageTime;
  };
}
