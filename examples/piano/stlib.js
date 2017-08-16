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

var queryBrowserType = function()
{
  var type = '';
  var ua = window.navigator.userAgent.toLowerCase();
  if ((ua.indexOf('msie') !== -1) || (ua.indexOf('trident') !== -1))
  {
    type = 'msie';
  }
  else if (ua.indexOf('edge') !== -1)
  {
    type = 'edge';
  }
  else if (ua.indexOf('safari') !== -1)
  {
    type = 'safari';
  }
  else if (ua.indexOf('firefox') !== -1)
  {
    type = 'firefox';
  }
  else if (ua.indexOf('opera') !== -1)
  {
    type = 'opera';
  }
  else if (ua.indexOf('chrome') !== -1)
  {
    type = 'chrome';
  }
  return type;
};

var isFullScreen = function()
{
  var r = false;
  if (document.fullscreenElement)
  {
    if (document.fullscreenElement !== null)
    {
      r = true;
    }
  }
  else if (document.msFullscreenElement)
  {
    if (document.msFullscreenElement !== null)
    {
      r = true;
    }
  }
  else if (document.webkitFullscreenElement)
  {
    if (document.webkitFullscreenElement !== null)
    {
      r = true;
    }
  }
  else if (document.mozFullScreenElement)
  {
    if (document.mozFullScreenElement !== null)
    {
      r = true;
    }
  }
  else if (document.mozFullScreen || document.webkitIsFullScreen)
  {
    r = true;
  }
  return r;
};

var requestFullScreen = function()
{
  var elem = document.documentElement;
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

var exitFullScreen = function()
{
  if (document.exitFullscreen)
  {
    document.exitFullscreen();
  }
  else if (document.webkitExitFullscreen)
  {
    document.webkitExitFullscreen();
  }
  else if (document.webkitCancelFullScreen)
  {
    document.webkitCancelFullScreen();
  }
  else if (document.mozCancelFullScreen)
  {
    document.mozCancelFullScreen();
  }
  else if (document.msExitFullscreen)
  {
    document.msExitFullscreen();
  }
};

var toggleFullScreen = function()
{
  if (isFullScreen() === true)
  {
    exitFullScreen();
  }
  else
  {
    requestFullScreen();
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
    self.ptr_in = 0;
    self.ptr_out = 0;
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

  this.peek = function()
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
    return d;
  };
}
