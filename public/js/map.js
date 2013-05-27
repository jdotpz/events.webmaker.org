define(['jquery', 'google', 'infobubble', 'markerclusterer', 'oms', 'event_model'],
    function ($, google, InfoBubble, MarkerClusterer, OverlappingMarkerSpiderfier, EventModel) {

    var defaultZoom = 13;

    function MapMaker(map_canvas, mapOptions, mcOptions) {
        this.map_canvas = map_canvas;
        this.google_map = new google.maps.Map(map_canvas, mapOptions);
        this.geocoder = new google.maps.Geocoder();
        this.markerManager = new MarkerClusterer(this.google_map, [], mcOptions);
        this.infoWindow = undefined;

        var self = this;
        // this handles multiple markers at the same location
        this.oms = new OverlappingMarkerSpiderfier(this.google_map);
        this.oms.addListener('click', function(marker, evt) {
            self.showInfoWindow(marker);
        });
    }
    MapMaker.prototype.dropPins = function (models) {
        var self = this;
        models.forEach(function (model) {
            console.log(model);
            setTimeout(function() { self.addMarker(model) },
                        300 + (500 * Math.random()));
        })
    };
    MapMaker.prototype.addMarker = function (model) {
        var icon = {
            url: "/img/map/pin-event.png",            // 43 x 51
            anchor: new google.maps.Point(23, 0)
        };

        var marker = new google.maps.Marker({
            title: model.title,
            position: new google.maps.LatLng(model.latitude, model.longitude),
            icon: icon,
            draggable: false,
            animation: google.maps.Animation.DROP,
            // Point where info window is shown, horizontal is not used in
            // infoBubble.js -- see markers anchor for this horizontal adjustment
            anchorPoint: new google.maps.Point(0, 20),
        });

        this.markerManager.addMarker(marker);
        this.oms.addMarker(marker);    // must keep oms in sync

        // store the content for the info window in the marker
        marker.set('infoContent', model.popupHTML());
        marker.set('model', model);

        return marker;
    };
    /* Delete all markers by removing references to them */
    MapMaker.prototype.clearMarkers = function () {
        this.markerManager.clearMarkers();
    }
    MapMaker.prototype.getMarkers = function() {
        return this.markerManager.getMarkers();
    };
    MapMaker.prototype.setupInfoWindow = function () {
        var self = this;
        google.maps.event.addListener(this.google_map, 'click', function(ev) {
            self.closeInfoWindow();
        });
    };
    MapMaker.prototype.closeInfoWindow = function () {
        if (this.infoWindow) {
            this.infoWindow.setMap(null);
            this.infoWindow = undefined;
        }
    };
    MapMaker.prototype.showInfoWindow = function(marker) {
        latLng = marker.position;

        // close info window if clicking on already shown info window
        if (this.infoWindow) {
            if (latLng.equals(this.infoWindow.get('position'))) {
                this.closeInfoWindow();
                return;
            }
        }

        this.closeInfoWindow();

        this.infoWindow = new InfoBubble({ // TODO: move styling into less/css file
            position: latLng,
            minWidth: 330,
            maxWidth: 330,
            minHeight: 210,
            maxHeight: 710,
            shadowStyle: 0,
            padding: 0,
            // Padding around the tabs, now set separately from the InfoBubble padding
            tabPadding: 12,
            // You can set the background color to transparent, and define a class instead
         // backgroundColor: 'transparent',
            borderRadius: 8,
            arrowSize: 20,
            borderWidth: 1,
            // Now that there is no borderWidth check, you can define
            // a borderColor and it will apply to Just the arrow
            borderColor: '#888888',
            disableAutoPan: false,
            hideCloseButton: true,
            arrowPosition: '50%',
            backgroundColor: 'rgba(247, 158, 0, 1)',
            // use the .phoney class to define all styling for your InfoBubble
            backgroundClassName: 'info-container',
            // define a CSS class name for all, this is technically the "inactive" tab class
            tabClassName: 'tabClass',
            // define a CSS class name for active tabs only
            activeTabClassName: 'activeTabClass',
            arrowStyle: 0
        });

        this.infoWindow.setContent(marker.get('infoContent'));
        this.infoWindow.open(this.google_map, marker);
    };
    MapMaker.prototype.setupAutocomplete = function (input, cityLevel, cb) {
        var options = { types: cityLevel ? ['(regions)'] : [] }; // [] is all
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        var google_map = this.google_map;
        autocomplete.bindTo('bounds', google_map);

        // listen for location changes on this text field and center the map on new position
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
            var place = autocomplete.getPlace();
            cb(place);
        });
    };

    MapMaker.prototype.updateLocation = function() {
        var google_map = this.google_map;
        function getCurrentPosition_success(pos) {
            var crd = pos.coords;
            var mapCenter = new google.maps.LatLng(crd.latitude, crd.longitude);
            google_map.setCenter(mapCenter);
        }
        function getCurrentPosition_error(err) {
            console.warn('ERROR(' + err.code + '): ' + err.message);
        };
        var options = {
            enableHighAccuracy: true,
            timeout: 1000,
            maximumAge: 0,
            };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getCurrentPosition_success, getCurrentPosition_error, options);
        } else {
            console.log("Sorry - your browser doesn't support geolocation!");
        }
    }

    function Address(place) {
        function findComponent(type, short) {
            place.address_components.forEach(function (c) {
                c.types.forEach(function (t) {
                    if (t == type)
                         return short ? c.short_name : c.long_name;
                });
            });
        };
        this.number     = findComponent("street_number",  false);
        this.street     = findComponent("route",          false);
        this.city       = findComponent("locality",       false);
        this.state      = findComponent("administrative_area_level_1", true);
        this.zip_code   = findComponent("postal_code",    true);
        this.country    = findComponent("country",        true);
    };
    Address.prototype.lines = function() {
        function X (x, y) { return x ? x + (y || '') : '' }
        return [
            X(this.number, ' ') + X(this.street,   ', ') + X(this.city, ', '),
            X(this.state,  ' ') + X(this.zip_code, ', ') + X(this.country)
        ]
    };
    Address.prototype.findPlace = function(cb) {
        var address = this.lines.join(' ');
        geocoder.geocode({ 'address': address }, function(results, status) {
            if (cb) cb(results, status == google.maps.GeocoderStatus.OK);
        });
    }
    EventModel.prototype.fromPlace = function(place) {
        return new EventModel({
            name:         place.name,
            address:      (new Address(place)).lines().join("\n"),
            latitude:     place.geometry.location.lat(),
            longitude:    place.geometry.location.lng(),
        })
    };

    function addDeleteAndLogButtons(map_canvas) {
        $("<button/>")
            .css({
                position: 'absolute',
                bottom: '12px',
                right: 0,
            })
            .text('Clear Markers')
            .appendTo($(map_canvas).parent())
            .click(deleteMarkers);

        $("<button/>")
            .css({
                position: 'absolute',
                bottom: '12px',
                left: 0,
            })
            .text('Log Markers')
            .appendTo($(map_canvas).parent())
            .click(logMarkers);
    }
    function addMegaMarkerButton(mapmaker) {
        $("<button/>")
            .css({
                position: 'absolute',
                bottom: '12px',
                right: 0,
            })
            .text('X')
            .appendTo($(mapmaker.map_canvas).parent())
            .click(function () {
                var sample = new EventModel({
                    title       : "Writing tests can be fun",
                    address     : "94117 Grove Street\nSan Francisco, CA",
                    date        : "Thursday June 23rd at 3pm",
                    description : "Tests can be fun if you know what your doing. Learn how here.",
                    organizer   : "Joey Bishop",
                    latitude    : 37.7755105,
                    longitude   : -122.43130139999999,
                });
                for (var i = 0; i < 49; ++i)
                    mapmaker.addMarker(sample);
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

        // set style immediately (for testing)
        //map.setOptions({styles: styles});

        var styledMap = new google.maps.StyledMapType(styles, {name: "Webmaker Map"});
        map.mapTypes.set('webmaker_style', styledMap);
    }
    function setupFunctionOverrides() {  // TODO: consolidate utils/polyfills
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

    return function () {
        setupFunctionOverrides();

        var mapCenter = new google.maps.LatLng(37.774546, -122.433523);
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
                mapTypeIds: [ 'webmaker_style',
                    google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE,
                    google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN ]
            },

            zoomControl: false,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE
            }
        };
        var mcOptions = {
            gridSize: 20,
            maxZoom: 15,    // Don't cluster after this zoom level
                            // Clicking on a cluster goes to zoom 16,
                            //  we don't want clusters at this level.
            imagePath: "/img/map/c",
            imageSizes: [43, 43, 43, 43, 43]
        };

        var mapmaker = new MapMaker(document.getElementById('map-canvas'), mapOptions, mcOptions);
        mapmaker.setupAutocomplete("address", false, function (place) {
        });
        mapmaker.setupAutocomplete("find-where", true, function (place) {
            if (place.geometry) {
                // If the place has a geometry, then present it on a map.
                if (place.geometry.viewport) {
                    google_map.fitBounds(place.geometry.viewport);
                } else {
                    google_map.setCenter(place.geometry.location);
                    google_map.setZoom(14);
                }
            }
        });
        mapmaker.setupInfoWindow();
        mapmaker.updateLocation() ;

        // some stuff I want to keep around, but should be disabled for public releases
        var debugging = false
        if (debugging) {
            addDeleteAndLogButtons();
            setColorOptions();
        }

        // this is for the demo only
        addMegaMarkerButton(mapmaker);

        EventModel.all(function (models) {
            mapmaker.dropPins(models);
        });
    };
});
