requirejs.config({
  deps: ['main'],
  paths: {
    async: '../ext/js/async',
    jquery: '../ext/js/jquery-1.9.1',
    moment: '../ext/js/moment',
    uri: '../ext/js/uri',
  },
  shim: {
    google: {
      exports: 'google',
    },
    jquery: {
      exports: 'jQuery',
    }
  }
});
