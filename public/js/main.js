require(['jquery', 'base/ui', 'map'],
  function ($, UI, Map) {
  'use strict';

  var $body = $('body'),
      $search = $('#search'),
      timerId;

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

  UI.select( '#search-filter' );

  timerId = setInterval(function(){
    if (google && google.maps) {
      clearInterval(timerId);
      Map();
    }
  }, 100);
});
