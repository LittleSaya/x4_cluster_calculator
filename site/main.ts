import rawMapData from '../data_manually_modified/full-map-manually.json'
import { parseMapData } from './util/map_data_parser'
import { App3D } from './App3D'

const mapData = parseMapData(rawMapData);

const app3D = new App3D(mapData);
await app3D.loadAssets();
app3D.initializeScene();
document.body.append(app3D.getCanvas());
app3D.renderLoop(performance.now());
