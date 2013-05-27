require(['jquery', 'base/webmaker', 'base/mediaGallery', 'base/ui', 'map'],
  function ($, webmaker, mediaGallery, UI, Map) {
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
    if (google && google.maps) {
      clearInterval(timerId);
      Map();
    }
  }, 100);
});
