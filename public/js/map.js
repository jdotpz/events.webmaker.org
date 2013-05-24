define(['jquery', 'google', 'infobubble', 'markerclusterer', 'oms'],
  function ($, google, InfosBubble, MarkerClusterer/*, window.overlappingMarkerSpiderfier*/) {

  var map;
  var oms;
  var geocoder;
  var infoWindow;
  var defaultZoom = 13;
  var markerManager;

  function dropPins() {
    var theModels = seedModels();

    for (var i in theModels) {
      (function(model) {

        setTimeout(function() {
          addMarker(model);
        }, 300 + (500 * Math.random()));

      })(theModels[i]);
    }
  }

  function seedModels() {
    jsonData = '[{"title":"Writing tests can be fun","address":"94117 Grove Street, San Francisco, CA","date":"Thursday June 23rd at 3pm","description":"Tests can be fun if you know what your doing. Learn how here.","organizer":"Joey Bishop","location":{"lat":37.7755105,"lng":-122.44130139999999}},' +
      '{"title":"Writing tests can be phun","address":"94117 Grove Street, San Francisco, CA","date":"Thursday June 23rd at 3pm","description":"Tests can be fun if you know what your doing. Learn how here.","organizer":"Joey Bishop","location":{"lat":37.7755105,"lng":-122.44130139999999}},' +
      '{"title":"Coding with Ruby","address":"4255 24th Street, San Francisco, CA","date":"Thurs July 23, 2014","description":"Learn to code Ruby with the guys from Amoeba.","organizer":"Amoe.ba","location":{"lat":37.750842,"lng":-122.43751500000002}},{"title":"Code by the Park","address":"94114 Abbey Street, San Francisco, CA","date":"Friday, January 2nd, 2pm","description":"Sit around Dolores Park and write code","organizer":"Sara Williams","location":{"lat":37.7635132,"lng":-122.42722679999997}},{"title":"Cobol for the Web","address":"94102 Franklin Street, San Francisco, CA","date":"Friday June 23rd, 3pm - 8pm","description":"Don\'t want to learn those new fancy smancy languages like Javascript?  Use Cobol!","organizer":"Dr. Dirk Dirkland","location":{"lat":37.7784056,"lng":-122.42160580000001}},{"title":"Coding with Python","address":"660 York Street, San Francisco, CA","date":"Wed March 23, 2014","description":"Learn to code Python with the guys from Amoeba.","organizer":"Amoe.ba","location":{"lat":37.7608724,"lng":-122.40920990000001}}]';

    var result = JSON.parse(jsonData);

    return result;
  }

  function addMarker(model) {
    var icon = {
      url: "../img/map/pin-event.png",      // 43 x 51
      anchor: new google.maps.Point(23, 0)
    };

    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(model.location.lat, model.location.lng),
      icon: icon,
      draggable: false,
      animation: google.maps.Animation.DROP,
      anchorPoint: new google.maps.Point(0, 20),  // point were info window is shown, horizontal is not used in infoBubble.js -  see markers anchor for this horizontal adjustment
      title: model.title
    });

    markerManager.addMarker(marker);
    oms.addMarker(marker);  // must keep oms in sync

    // model needs organizerURL and detailsURL, add them here
    var copiedModel = $.extend({}, model);

    copiedModel["organizerURL"] = "#";  // SNG need real data here
    copiedModel["detailsURL"] = "/events/" + model.id;

    // store the content for the info window in the marker
    marker.set('infoContent', infoWindowContent(copiedModel));
    marker.set('model', model);

    return marker;
  }

  function showInfoForMarker(marker) {
    showInfobubble(marker);
  }

  function setupSharedInfoWindow() {
    google.maps.event.addListener(map, 'click', function(event) {
      closeInfoWindow();

      // should only be enabled for debugging
      // logInfoForLocation(event.latLng);
    });
  }

  function logInfoForLocation(location) {
      geocoder.geocode( { 'latLng': location}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var placeData = placeToDataObject(results[0]);

        console.log(JSON.stringify(eventFormData(placeData, true)));
      }
    });
  }

  function setColorOptions() {
    var styles = [
      {
        featureType: "all",
        stylers: [
          { saturation: -80 }
        ]
      },{
        featureType: "road.arterial",
        elementType: "geometry",
        stylers: [
          { hue: "#00ffee" },
          { saturation: 50 }
        ]
      },{
        featureType: "poi.business",
        elementType: "labels",
        stylers: [
          { visibility: "off" }
        ]
      }
    ];

    // for setting it immediately for testing
    //   map.setOptions({styles: styles});

    var styledMap = new google.maps.StyledMapType(styles, {name: "Webmaker Map"});

    map.mapTypes.set('webmaker_style', styledMap);
  //  map.setMapTypeId('webmaker_style');
  }

  // Deletes all markers in the array by removing references to them
  function deleteMarkers() {
    markerManager.clearMarkers();
  }

  // called from GeoCode button
  function eventPanelAddButton() {
    var address = document.getElementsByName('event[address]')[0].value; // FIXME
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var placeData = placeToDataObject(results[0]);

        adjustBoundsForPlace(results[0]);

        var marker = addMarker(eventFormData(placeData, false));

        showInfoForMarker(marker);

      } else {
        alert('Address not found: ' + status);
      }
    });
  }

  function setupAutocomplete(itemName, cityLevel) {
    var autocomplete=null;

    var inputs = document.getElementsByName(itemName);

    if (inputs.length > 0) {
      var options = {
        types: cityLevel ? ['(regions)'] : []  // [] is all
      };

      autocomplete = new google.maps.places.Autocomplete(inputs[0], options);
      autocomplete.bindTo('bounds', map);
    }

    return autocomplete;
  }

  function placeToDataObject(place) {
    var theName = place.name;
    if (!theName) {
      theName = '(not specified)';
    }

    var theIcon = place.name;
    if (!theIcon) {
      theName = 'unknown';
    }

    var result = {
      location: convertLatLngToObject(place.geometry.location),
      name: theName,
      address: addressFromPlace(place),
      icon: theIcon
    }

    return result;
  }

  function adjustBoundsForPlace(place) {
    if (place.geometry) {
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
      }
    }
  }

  function extractFromAdress(components, type, short){
    for (var i=0; i<components.length; i++) {
      for (var j=0; j<components[i].types.length; j++) {
         if (components[i].types[j] == type) {
           return short ? components[i].short_name : components[i].long_name;
         }
      }
    }

    return "";
  }

  function addressFromPlace(place) {
    var address = '';
    if (place.address_components) {
      var postCode = extractFromAdress(place.address_components, "postal_code", true);
      var street = extractFromAdress(place.address_components, "route", false);
      var town = extractFromAdress(place.address_components, "locality", false);
      var state = extractFromAdress(place.address_components, "administrative_area_level_1", true);

  //    console.log(JSON.stringify(place.address_components));

      address = "{0} {1}, {2}, {3}".interpolate([postCode, street, town, state]);
    }

    return address;
  }

  function infoWindowContent(params) {
    var result = '<div class="info-content">'+
      '<div class="info-title">{title}</div>' +

      '<div class="info-when-where">' +
        '<a href="#"><img src="../img/map/calendar.png" class="icon-img" /></a>' +
        '<div class="info-date">{date}</div>' +
        '<br/>' +
        '<a href="#"><img src="../img/map/pin-event.png" class="icon-img" /></a>' +
        '<div class="info-address">{address}</div>' +
      '</div>' +

      '<div class="info-description">{description}</div>' +
      '<a href="{organizerURL}"><img src="http://lorempixel.com/75/75/" class="organizer-img" /></a>' +
      '<div class="info-organizer"><span class="title">Organized by</span><br/>{organizer}</div>' +

      // show description button
      '<a href="{detailsURL}">' +
      '<span class="icon-stack icon-button-size info-button">' +
        '<i class="icon-sign-blank icon-stack-base icon-button-color"></i>' +
        '<i class="icon-chevron-right icon-light"></i>' +
      '</span>' +
      '</a>' +

      '</div>';

    return result.interpolate(params);
  }

  function eventFormData(placeData, usePlaceAddress) {
    var result = {
  //    title: document.getElementById('event-title').value,
  //    address: usePlaceAddress ? placeData.address : document.getElementById('event-address').value,
  //    date: document.getElementById('event-date').value,
  //    description: document.getElementById('event-description').value,
  //    organizer: document.getElementById('event-organizer').value,
  //    location: placeData.location
    }

    return result;
  }

  function logMarkers() {
    var models = [];

    markers = markerManager.getMarkers();

    for (var i in markers) {
      marker = markers[i];
      models.push(marker.get('model'));
    }

    result = JSON.stringify(models);

    // must escape single quotes
    result = result.replace("'", "\\'");

    console.log("'" + result + "'");
  }

  function convertLatLngToObject(latLng) {
    result = {
      lat: latLng.lat(),
      lng: latLng.lng()
    }

    return result;
  }

  function setupFunctionOverrides() {
    // string helper function to interpolate
    if (!String.prototype.interpolate) {
      String.prototype.interpolate = function (o) {
        return this.replace(
          /\{([^{}]*)\}/g,
          function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
          }
        );
      };
    }
  }

  function addDeleteAndLogButtons() {
    var theDiv = $("<button/>");
    theDiv.css({
      position: 'absolute',
      bottom: '12px',
      right: 0,
    });
    theDiv.text('Clear Markers');
    theDiv.appendTo($('#map-canvas').parent());
    theDiv.click(deleteMarkers);

    theDiv = $("<button/>");
    theDiv.css({
      position: 'absolute',
      bottom: '12px',
      left: 0,
    });
    theDiv.text('Log Markers');
    theDiv.appendTo($('#map-canvas').parent());
    theDiv.click(logMarkers);
  }

  function closeInfoWindow() {
    if (infoWindow) {
      infoWindow.setMap(null);
      infoWindow = undefined;
    }
  }

  function showInfobubble(marker) {
    latLng = marker.position;

    // close info window if clicking on already shown info window
    if (infoWindow) {
      if (latLng.equals(infoWindow.get('position'))) {
        closeInfoWindow();
        return;
      }
    }

    content = marker.get('infoContent');

    closeInfoWindow();

    infoWindow = new InfoBubble({
      position: latLng,
      minWidth: 310,
      maxWidth: 310,
      minHeight: 210,
      maxHeight: 610,
      shadowStyle: 0,
      padding: 0,
      /**
       * Padding around the tabs, now set seperately
       * from the InfoBubble padding
       **/
      tabPadding: 12,
      /**
       * You can set the background color to transparent,
       * and define a class instead
       **/
  //    backgroundColor: 'transparent',
      borderRadius: 8,
      arrowSize: 20,
      borderWidth: 1,
      /**
       * Now that there is no borderWidth check,
       * you can define a borderColor and it will
       * apply to Just the arrow
       **/
      borderColor: '#888888',
      disableAutoPan: false,
      hideCloseButton: true,
      arrowPosition: '50%',
      backgroundColor: 'rgba(247, 158, 0, 1)',
      /**
       * use the .phoney class to define all styling
       * for your InfoBubble
       **/
      backgroundClassName: 'info-container',
      /**
       * define a CSS class name for all, this is
       * technically the "inactive" tab class
       **/
      tabClassName: 'tabClass',
      /**
       * define a CSS class name for active tabs only
       **/
      activeTabClassName: 'activeTabClass',
      arrowStyle: 0
    });

    infoWindow.setContent(content);
    infoWindow.open(map, marker);
  }

  function getCurrentPosition_success(pos) {
    var crd = pos.coords;
   
//    console.log('Your current position is:');
//    console.log('Latitude : ' + crd.latitude);
//    console.log('Longitude: ' + crd.longitude);
//    console.log('More or less ' + crd.accuracy + ' meters.');

    var mapCenter = new google.maps.LatLng(crd.latitude, crd.longitude);
    map.setCenter(mapCenter);
  };
   
  function getCurrentPosition_error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
  };
   
  function updateLocation() {
    var options = {
  //    enableHighAccuracy: true,
  //      timeout: 1000,
  //      maximumAge: 0
      };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(getCurrentPosition_success, getCurrentPosition_error, options);
    } else {
      console.log("Sorry - your browser doesn't support geolocation!");
    }
  }

  /*
  1) don't cluster if already zoomed in.
  2) use fontawesome for buttons
  3) size calc not working on info window?

  what are the blue dots vs. the normal blue marker?

  how search by location?  zip code? area code? current location?  current map?

  standard UI for entering date and time?

  searching by date?  How do we pick a range to search?

  it would be ideal to get new icons for heat map that had their content area in the center to make it easier to position text

  simplify map and remove all but zoom controls like mock up

  there are some assets needed:
    calendar, marker for info window
    where and when icons for search ui

  */

  // called from /views/map.html to install the google map
  var self = {
    init: function () {
      var mapCenter = new google.maps.LatLng(37.774546, -122.433523);
      geocoder = new google.maps.Geocoder();

      setupFunctionOverrides();

      var mapOptions = {
        zoom: defaultZoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: mapCenter,

        panControl: false,
        rotateControl: false,
        scaleControl: false,
        streetViewControl: true,
        overviewMapControl: false,

        mapTypeControl: false,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN, 'webmaker_style']
        },

        zoomControl: false,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.LARGE
        }
      };

      map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

      setupAutocomplete("event[address]", false);

      ac = setupAutocomplete("find-where", true);

      // listen for location changes on this text field and center the map on new position
      google.maps.event.addListener(ac, 'place_changed', function() {
        var place = ac.getPlace();
        if (place.geometry) {
          // If the place has a geometry, then present it on a map.
          if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
          } else {
            map.setCenter(place.geometry.location);
            map.setZoom(14);
          }
        }
      });

      setupSharedInfoWindow();
      updateLocation();


      // setup form toggle button
      $("h2.formExpandButton").click(function(e) {
        e.preventDefault();

        $("form#create-event").toggleClass('toggleHidden');
        $("#add-event-button").toggleClass('toggleHidden');
      });


      // this handles the multiple markers at the same location problem.
      oms = new OverlappingMarkerSpiderfier(map);
      oms.addListener('click', function(marker, event) {
        showInfoForMarker(marker);
      });

      // some stuff I want to keep around, but should be disabled for public releases
      var debugging = false
      if (debugging) {
        addDeleteAndLogButtons();
        setColorOptions();
      }

      var mcOptions = {
        gridSize: 20,
        maxZoom: 15,   // don't cluster after this zoom level.  Clicking on a cluster goes to zoom 16, we don't want clusters at this level
        imagePath: "../img/map/c",
        imageSizes: [43, 43, 43, 43, 43]
      };
      markerManager = new MarkerClusterer(map, [], mcOptions);

      setTimeout( function() {
        dropPins();
      }, 500)
    }
  };
  return self;
});
 
