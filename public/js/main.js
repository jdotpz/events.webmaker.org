require(['jquery', 'base/webmaker', 'base/mediaGallery', 'map'],
  function ($, webmaker, mediaGallery, Map) {
  'use strict';

  var $body = $('body'),
      timerId;

  webmaker.init({
    page: $body[0].id,
    makeURL: $body.data('endpoint')
  });

  mediaGallery.init(webmaker);

  timerId = setInterval(function(){
    if (typeof google !== undefined && typeof google.maps !== undefined) {
      clearInterval(timerId);
      Map.init();
    }
  }, 100);
});
