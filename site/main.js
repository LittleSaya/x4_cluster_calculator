import Map from 'ol/Map.js'
import View from 'ol/View.js'
import VectorLayer from 'ol/layer/Vector.js'
import VectorSource from 'ol/source/Vector.js'
import PointGeom from 'ol/geom/Point.js'
import Feature from 'ol/Feature.js'
import * as style from 'ol/style.js'
import * as color from 'ol/color.js'

import x4map from '../full-map.json'

const mapLayer = new VectorLayer({
  zIndex: 0,
  source: new VectorSource(),
  style: function (feature, reso) {
    return new style.Style({
      image: new style.Circle({
        radius: 13,
        fill: new style.Fill({
          color: color.fromString('green'),
        }),
        stroke: new style.Stroke({
          color: color.fromString('green'),
          width: 1,
        }),
        zIndex: 0
      }),
      text: new style.Text({
        text: feature.getProperties().label,
        fill: new style.Fill({
          color: 'black'
        }),
        font: '14px sans-serif',
        textBaseline: 'middle',
        offsetY: 2
      }),
      zIndex: 1
    })
  }
});

const factoryLayer = new VectorLayer({
  zIndex: 1,
  source: new VectorSource()
});

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

// 绘制地图框架
for (const clusterId in x4map) {
  const cluster = x4map[clusterId];
  let name;
  for (const fullSectorId in cluster.sectors) {
    const sector = cluster.sectors[fullSectorId];
    name = sector.name;
    break;
  }
  const coordinate = cluster.coordinate;
  const feature = new Feature(new PointGeom(coordinate));
  feature.setProperties({ label: name });
  mapLayer.getSource().addFeature(feature);
}
