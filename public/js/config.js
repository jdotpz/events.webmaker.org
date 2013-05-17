requirejs.config({
  deps: ['main', 'map'],
  paths: {
    'jquery': '../ext/js/jquery-1.9.1'
  },
  shim: {
    'jquery': {
      exports: 'jQuery'
    }
  }
});
