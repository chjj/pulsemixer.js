/**
 * pulsemixer.js - an alsamixer-like interface for PulseAudio
 * Copyright (c) 2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/pulsemixer.js
 */

var cp = require('child_process')
  , path = require('path')
  , fs = require('fs')
  , blessed = require('blessed');

function pulsemixer() {
  return pulsemixer;
}

try {
  fs.mkdirSync(process.env.HOME + '/.pulsemixer');
} catch (e) {
  ;
}

try {
  pulsemixer.config = require(process.env.HOME + '/.pulsemixer/config.json');
} catch (e) {
  pulsemixer.config = {};
}

pulsemixer.start = function(callback) {
  var screen = blessed.screen({
    autoPadding: true,
    fastCSR: true,
    log: process.env.HOME + '/.pulsemixer/debug.ui.log'
  });

  pulsemixer.screen = screen;

  screen._.target = null;

  screen._.wrapper = blessed.box({
    parent: screen,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  });

  screen._.bar = blessed.listbar({
    parent: screen._.wrapper,
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    keys: true,
    mouse: true,
    autoCommandKeys: true,
    style: {
      item: {
        fg: 'blue',
        hover: {
          fg: 'white',
          bg: 'black'
        }
      },
      selected: {
        fg: 'white',
        bg: 'black'
      },
      prefix: {
        fg: 'white'
      }
    }
  });

  screen._.sep = blessed.line({
    parent: screen._.wrapper,
    top: 1,
    left: 0,
    right: 0,
    orientation: 'horizontal'
  });

  var tabs = screen._.tabs = {};

  ['playback',
   'capture',
   'all',
   'debug'].forEach(function(name) {
    if (name === 'debug' && !pulsemixer.config.debug) {
      return;
    }

    var tab = tabs[name] = blessed.box({
      top: 2,
      left: 0,
      right: 0,
      bottom: 0,
      scrollable: true,
      keys: true,
      vi: true,
      alwaysScroll: true,
      scrollbar: {
        ch: ' '
      },
      style: {
        scrollbar: {
          inverse: true
        }
      }
    });

    screen._.bar.addItem({
      text: name,
      callback: function() {
        // if (screen._.msg) screen._.msg.hide();
        if (screen._.target) screen._.target.detach();
        screen._.wrapper.append(tab);
        tab.focus();
        screen._.target = tab;
        screen.render();
      }
    });
  });

  screen._.bar.commands[0].callback();

  function exit() {
    //screen._.msg.hide = function() {};
    //screen._.msg.display('Shutting down...', -1);
    return callback();
  }

  function refresh() {
    ;
  }

  screen.key('f5', function() {
    return refresh(null, true);
  });

  screen.ignoreLocked.push('C-c');

  screen.key('C-c', function(ch, key) {
    return exit();
  });
};

module.exports = pulsemixer;
