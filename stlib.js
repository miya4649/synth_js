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

var execFullScreen = function(element_id)
{
  var elem = document.getElementById(element_id);
  if (elem.requestFullscreen)
  {
    elem.requestFullscreen();
  }
  else if (elem.webkitRequestFullscreen)
  {
    elem.webkitRequestFullscreen();
  }
  else if (elem.mozRequestFullScreen)
  {
    elem.mozRequestFullScreen();
  }
  else if (elem.msRequestFullscreen)
  {
    elem.msRequestFullscreen();
  }
};

var randI = function(max)
{
  return Math.floor(Math.random() * max);
};

function RandF()
{
  var r = 0x92d68ca2;

  this.seed = function(s)
  {
    r = 0x92d68ca2 ^ s;
  };

  this.get = function()
  {
    r = r ^ (r << 13);
    r = r ^ (r >> 17);
    r = r ^ (r << 5);
    return ((r & 0x7fffffff) * 4.656612873e-10);
  };
}

function Fifo()
{
  var self = this;
  var objects = 0;
  this.ptr_in = 0;
  this.ptr_out = 0;
  this.data = [];

  this.init = function(size)
  {
    objects = size;
    var i;
    for (i = 0; i < objects; i++)
    {
      self.data[i] = null;
    }
  };

  this.push = function(data_arg)
  {
    var pi = self.ptr_in;
    var po = self.ptr_out;
    pi++;
    if (pi >= objects)
    {
      pi -= objects;
    }
    if (pi === po)
    {
      return;
    }
    self.data[pi] = data_arg;
    self.ptr_in = pi;
    return true;
  };

  this.pop = function()
  {
    var pi = self.ptr_in;
    var po = self.ptr_out;
    if (pi === po)
    {
      return;
    }
    po++;
    if (po >= objects)
    {
      po -= objects;
    }
    var d = self.data[po];
    self.ptr_out = po;
    return d;
  };
}
