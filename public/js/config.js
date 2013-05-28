requirejs.config({
  deps: ['main'],
  paths: {
    async:  '/ext/js/async',
    jquery: '/ext/js/jquery-1.9.1',
    packery: '/ext/js/packery',
    moment: '/ext/js/moment',
    uri:    '/ext/js/uri',
  },
  shim: {
    google: { exports: 'google' },
    jquery: { exports: 'jQuery' },
    packery: { exports: 'Packery' },
    oms:    { exports: 'OverlappingMarkerSpiderfier' },
  }
});
