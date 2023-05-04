import { parseMapData } from './map_data_parser'
import rawMapData from '../data_manually_modified/full-map-manually.json'

const mapData = parseMapData(rawMapData);

console.log('dbg mapData', mapData);
