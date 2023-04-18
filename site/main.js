import Map from 'ol/Map.js';
import View from 'ol/View.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';

const mapLayer = new VectorLayer({ source: new VectorSource() });
const factoryLayer = new VectorLayer({ source: new VectorSource() });

const map = new Map({
  target: 'map_container',
  layers: [
    mapLayer,
    factoryLayer
  ],
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});
