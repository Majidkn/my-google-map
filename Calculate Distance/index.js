var markers = [];
function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: {lat: 35.703171, lng: 51.39511600000003},
        disableDefaultUI: true,
        mapTypeControl: false,
    });
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
    function showPosition(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        map.setCenter(new google.maps.LatLng(lat, lng));
        map.setZoom(15);
    }
    google.maps.event.addListener(map, 'click', function(event) {
        if(markers.length != 2){
            var marker = new google.maps.Marker({
                position: event.latLng,
                map: map,
                draggable: true,
                icon: "marker.png"
            });
            markers.push(marker);
            google.maps.event.addListener(marker, 'mouseup', function(event) {
                var latLng = event.latLng;
            });
            if(markers.length == 2){
                $('.calculate').css({display:'block'})
            }
        }
    });

}

function distance(){
    $('.wait').css({display: 'flex'});
    var geocoder = new google.maps.Geocoder;
    var service = new google.maps.DistanceMatrixService;
    var markersArray = [];

    service.getDistanceMatrix({
        origins: [{lat: markers[0].position.lat(), lng: markers[0].position.lng()}],
        destinations: [{lat: markers[1].position.lat(), lng: markers[1].position.lng()}],
        travelMode: 'DRIVING',
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
    }, function(response, status) {
        if (status !== 'OK') {
            alert('Error was: ' + status);
        } else {
            var originList = response.originAddresses;
            var destinationList = response.destinationAddresses;
            var outputDiv = document.getElementById('output');
            outputDiv.innerHTML = '';
            deleteMarkers(markersArray);

            var showGeocodedAddressOnMap = function() {
                return function(results, status) {
                    if (status === 'OK') {
                        map.fitBounds(bounds.extend(results[0].geometry.location));
                        markersArray.push(new google.maps.Marker({
                            map: map,
                            position: results[0].geometry.location,
                        }));
                    } else {
                        alert('Geocode was not successful due to: ' + status);
                    }
                };
            };

            for (var i = 0; i < originList.length; i++) {
                var results = response.rows[i].elements;
                geocoder.geocode({'address': originList[i]},
                showGeocodedAddressOnMap());
                for (var j = 0; j < results.length; j++) {
                    geocoder.geocode({'address': destinationList[j]},
                    showGeocodedAddressOnMap());
                    $('.wait').css({display: 'none'});
                    outputDiv.innerHTML += '<div class="origin">From: ' + originList[i] + '</div><div class="destination">To: ' + destinationList[j] +
                    '</div><div class="distance">Distance: ' + results[j].distance.text + '</div><div class="duration">Duration :' +
                    results[j].duration.text + '</div>';
                }
                $('#output').css({display:'block'})
            }
        }
    });
}
function deleteMarkers(markersArray) {
    for (var i = 0; i < markersArray.length; i++) {
        markersArray[i].setMap(null);
    }
    markersArray = [];
}
