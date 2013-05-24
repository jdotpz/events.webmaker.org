require(['jquery', 'base/webmaker', 'base/mediaGallery', 'map', 'base/ui'],
  function ($, webmaker, mediaGallery, Map, UI) {
  'use strict';

  var $body = $('body'),
      $search = $('#search'),
      timerId;

  webmaker.init({
    page: $body[0].id,
    makeURL: $body.data('endpoint')
  });

  $('.search-trigger').click( function( e ) {
    $search.toggleClass('on');
  });

  $('#bottom-search-btn').click( function( e ) {
    $('html, body').animate({
      scrollTop: 0
    }, 300, function() {
      $search.addClass('on');
    });
  });

  mediaGallery.init(webmaker);

  UI.select( '#search-filter' );

  timerId = setInterval(function(){
    if (typeof google !== undefined && typeof google.maps !== undefined) {
      clearInterval(timerId);
      Map.init();
    }
  }, 100);
});
