import { getParsedMap } from './util/map_data_parser'
import { App3D } from './App3D/main'

const mapData = getParsedMap();

const app3D = new App3D(mapData);
await app3D.loadAssets();
app3D.initializeScene();
document.body.append(app3D.getCanvas());
app3D.renderLoop(performance.now());
