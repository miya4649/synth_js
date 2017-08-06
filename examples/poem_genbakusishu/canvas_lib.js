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

function CanvasLib()
{
  var canvas;
  var ctx;
  var context;
  var width;
  var height;
  var callback;
  var resized = true;
  var averageTime = 16.666666;
  var fpsCounter = 0;
  var dateTime;
  var bgcolor = '#000000';

  var clearScreen = function()
  {
    ctx.fillStyle = bgcolor;
    ctx.fillRect(0, 0, width, height);
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
    clearScreen();
    resized = true;
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

  this.init = function(canvas_arg, callback_arg)
  {
    canvas = document.getElementById(canvas_arg);
    ctx = canvas.getContext('2d');
    callback = callback_arg;
    fpsCounter = 0;
    dateTime = Date.now();
    resize();
    window.addEventListener('resize', delayResize);
  };

  this.drawText = function(text, x, y, font, color)
  {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
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
