// Bootstrap main that lets us use ES6, JSX, etc.
// Through the rest of our app code.
// NOTE: This must remain ES5 code.
require('electron-compile').init();
require('./app.js');
