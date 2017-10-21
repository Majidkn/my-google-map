let markers = [];
var initMap = () => {
    let map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: {lat: 35.703171, lng: 51.39511600000003},
        disableDefaultUI: true,
        mapTypeControl: false,
    });

    (navigator.geolocation)?
        navigator.geolocation.getCurrentPosition(showPosition):
        alert("Geolocation is not supported by this browser.");

    function showPosition(position) {
        let lat = position.coords.latitude;
        let lng = position.coords.longitude;
        map.setCenter(new google.maps.LatLng(lat, lng));
        map.setZoom(15);
    }
    google.maps.event.addListener(map, 'click', (event) => {
        if(markers.length != 2){
            let marker = new google.maps.Marker({
                position: event.latLng,
                map: map,
                draggable: true,
                icon: "marker.png"
            });
            markers.push(marker);
            google.maps.event.addListener(marker, 'mouseup', (event) => {
                let latLng = event.latLng;
            });
            if(markers.length == 2){
                $('.calculate').css({display:'block'})
            }
        }
    });
}

let distance = () => {
    $('.wait').css({display: 'flex'});
    let geocoder = new google.maps.Geocoder;
    let service = new google.maps.DistanceMatrixService;
    let markersArray = [];

    service.getDistanceMatrix({
        origins: [{lat: markers[0].position.lat(), lng: markers[0].position.lng()}],
        destinations: [{lat: markers[1].position.lat(), lng: markers[1].position.lng()}],
        travelMode: 'DRIVING',
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
    }, (response, status) => {
        if (status !== 'OK') {
            alert('Error was: ' + status);
        } else {
            let originList = response.originAddresses;
            let destinationList = response.destinationAddresses;
            let outputDiv = $('.output');
            outputDiv.html('');
            deleteMarkers(markersArray);

            var showGeocodedAddressOnMap = () => {
                return (results, status) => {
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

            for (let i = 0; i < originList.length; i++) {
                let results = response.rows[i].elements;
                geocoder.geocode({'address': originList[i]},
                showGeocodedAddressOnMap());
                for (let j = 0; j < results.length; j++) {
                    geocoder.geocode({'address': destinationList[j]},
                    showGeocodedAddressOnMap());
                    $('.wait').css({display: 'none'});
                    outputDiv.append('<div class="origin">From: ' + originList[i] + '</div><div class="destination">To: ' + destinationList[j] +
                    '</div><div class="distance">Distance: ' + results[j].distance.text + '</div><div class="duration">Duration :' +
                    results[j].duration.text + '</div>');
                }
                $('.output').css({display:'block'})
            }
        }
    });
}
let deleteMarkers = (markersArray) => {
    for (let marker of markersArray){
        marker.setMap(null);
    }
    markersArray = [];
}
