
var markersArray = [];
var map;
var geocoder;
var infoWindow;
var defaultZoom = 13;

// called from /views/map.html to install the google map

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

function initializeMap() {
  var mapCenter = new google.maps.LatLng(37.774546, -122.433523);
  geocoder = new google.maps.Geocoder();

  var mapOptions = {
    zoom: defaultZoom,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: mapCenter,

    panControl: true,
    rotateControl: true,
    scaleControl: true,
    streetViewControl: true,
    overviewMapControl: true,

    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN, 'webmaker_style']
    },

    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.LARGE
    }
  };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  setColorOptions();
  setupAutocomplete();
  setupSharedInfoWindow();

  setTimeout( function() {
    dropPins();
  }, 500)
}

function dropPins() {
  var jsonData = '[{"title":"Coding with Ruby","address":"4255 24th Street, San Francisco, CA","date":"Thurs July 23, 2014","description":"Learn to code Ruby with the guys from Amoeba.","organizer":"Amoe.ba","location":{"hb":37.750842,"ib":-122.43751500000002}},{"title":"Code by the Park","address":"94114 Abbey Street, San Francisco, CA","date":"Friday, January 2nd, 2pm","description":"Sit around Dolores Park and write code","organizer":"Sara Williams","location":{"hb":37.7635132,"ib":-122.42722679999997}},{"title":"Coding with Python","address":"660 York Street, San Francisco, CA","date":"Wed March 23, 2014","description":"Learn to code Python with the guys from Amoeba.","organizer":"Amoe.ba","location":{"hb":37.7608724,"ib":-122.40920990000001}},{"title":"Writing tests can be fun","address":"94117 Grove Street, San Francisco, CA","date":"Thursday June 23rd at 3pm","description":"Tests can be fun if you know what your doing. Learn how here.","organizer":"Joey Bishop","location":{"hb":37.7755105,"ib":-122.44130139999999}}]';
  var theModels = JSON.parse(jsonData);

  for (var i in theModels) {
    (function(model) {

      setTimeout(function() {
        addMarker(model);
      }, 300 + (500 * Math.random()));

    })(theModels[i]);
  }
}

function addMarker(model) {

  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(model.location.hb, model.location.ib),
    map: map,
    draggable: false,
    animation: google.maps.Animation.DROP,
    title: model.title
  });

  markersArray.push(marker);

  // store the content for the info window in the marker
  marker.set('infoContent', infoWindowContent(model));
  marker.set('model', model);

  google.maps.event.addListener(marker, 'click', function() {
    showInfoForMarker(this);
  });

  return marker;
}

function showInfoForMarker(marker) {
  infoWindow.setContent(marker.get('infoContent'));
  infoWindow.open(map, marker);
}

function setupSharedInfoWindow() {
  infoWindow = new google.maps.InfoWindow;

  google.maps.event.addListener(map, 'click', function(event) {
    infoWindow.close();

    // should only be enabled for debugging
    logInfoForLocation(event.latLng);
  });
}

function logInfoForLocation(location) {
    geocoder.geocode( { 'latLng': location}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      var placeData = placeToDataObject(results[0]);

      console.log(JSON.stringify(partyFormData(placeData, true)));

    } else {
      alert('Address not found: ' + status);
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

// Removes the overlays from the map, but keeps them in the array
function removeMarkers() {
  if (markersArray) {
    for (var i in markersArray) {
      markersArray[i].setMap(null);
    }
  }
}

// Shows any overlays currently in the array
function showMarkers() {
  if (markersArray) {
    for (var i in markersArray) {
      markersArray[i].setMap(map);
    }
  }
}

// Deletes all markers in the array by removing references to them
function deleteMarkers() {
  removeMarkers();
  markersArray.length = 0;
}

// called from GeoCode button
function partyPanelAddButton() {
  var address = document.getElementById('party-address').value;
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      var placeData = placeToDataObject(results[0]);

      adjustBoundsForPlace(results[0]);

      var marker = addMarker(partyFormData(placeData, false));

      showInfoForMarker(marker);

    } else {
      alert('Address not found: ' + status);
    }
  });
}

function setupAutocomplete() {
  var defaultBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(-33.8902, 151.1759),
    new google.maps.LatLng(-33.8474, 151.2631));

  var input = document.getElementById('party-address');
  var options = {
//    bounds: defaultBounds,
    types: []  // all
  };

  autocomplete = new google.maps.places.Autocomplete(input, options);

  autocomplete.bindTo('bounds', map);

  // setup places changed listener to add marker when changed
  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    // save these results for when they hit the add party button
    // var placeData = placeToDataObject(autocomplete.getPlace());
  });
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
    location: place.geometry.location,
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
  var result = '<div id="info-content">'+
    '<div id="info-title">{title}</div>' +
    '<div id="info-date">{date}</div>' +
    '<div id="info-address">{address}</div>' +
    '<div id="info-description">{description}</div>' +
    '<div id="info-organizer">{organizer}</div>' +
    '</div>';

  return result.interpolate(params);
}

function partyFormData(placeData, usePlaceAddress) {
  var result = {
    title: document.getElementById('party-title').value,
    address: usePlaceAddress ? placeData.address : document.getElementById('party-address').value,
    date: document.getElementById('party-date').value,
    description: document.getElementById('party-description').value,
    organizer: document.getElementById('party-organizer').value,
    location: placeData.location
  }

  return result;
}

function logMarkers() {
  var markers = [];

  for (var i in markersArray) {
    marker = markersArray[i];
    markers.push(marker.get('model'));
  }

  console.log(JSON.stringify(markers));
}

