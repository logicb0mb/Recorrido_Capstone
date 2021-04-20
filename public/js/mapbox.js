/* eslint-disable*/

export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoic2hyZXlhczE2MDAiLCJhIjoiY2sxcWpreHA5MTR2cTNjbzY4ODYxejdyZyJ9.dqgF_JF6CHfEqmaYUvyE3w';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/shreyas1600/ck1qksj4t0fus1cqe2i6w9akk',
    scrollZoom: false
    //   center: [-118.4706712, 34.111745], //Mapbox is like mongoDB lng first the lat
    //   zoom: 4,
    //   interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    //   Add Marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom' //To set which part of image points to exact GPS location
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add Popup
    new mapboxgl.Popup({
      offset: 30,
      closeOnClick: false
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 200,
      right: 200
    }
  });
};
