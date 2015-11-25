#!/usr/bin/env electron

// install babel hooks in the main process
require('electron-compile').init();

require('./main');
