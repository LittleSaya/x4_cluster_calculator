/**
 * 提供一个函数以及一系列类型，用于解析游戏地图数据
 */

import { Vector3 } from 'three'
import rawMapData from '@/data_manually_modified/full-map-manually.json'

export type ClusterId = string;

export type SectorId = string;

export class SectorDef {

  /**
   * 原始坐标
   */
  coordinate: Vector3;

  name: string;

  ownership: string;

  constructor (coordinate: Vector3, name: string, ownership: string) {
    this.coordinate = coordinate;
    this.name = name;
    this.ownership = ownership;
  }
};

export class ClusterDef {

  /**
   * 原始坐标
   */
  coordinate: Vector3;

  sectors: Map<SectorId, SectorDef>;

  ownership: string;

  constructor (coordinate: Vector3, sectors: Map<SectorId, SectorDef>, ownership: string) {
    this.coordinate = coordinate;
    this.sectors = sectors;
    this.ownership = ownership;
  }
};

let parsedMap: Map<ClusterId, ClusterDef> | undefined = undefined;

export function getParsedMap (): Map<ClusterId, ClusterDef> {
  if (parsedMap) {
    return parsedMap;
  }
  console.log('Parsing map data');

  const galaxyMap = new Map<ClusterId, ClusterDef>();
  for (const clusterId in rawMapData) {
    const clusterObj = rawMapData[clusterId];
    const sectorsMap = new Map<SectorId, SectorDef>();
    const coordinate = clusterObj.coordinate;
    const ownership = clusterObj.ownership;
    const sectorsObj = clusterObj.sectors;
    for (const sectorId in sectorsObj) {
      const sectorObj = sectorsObj[sectorId];
      const coordinate = sectorObj.coordinate;
      const name = sectorObj.name;
      const ownership = sectorObj.ownership;
      sectorsMap.set(sectorId, new SectorDef(
        new Vector3(coordinate[0], coordinate[1], coordinate[2]),
        name,
        ownership
      ));
    }
    galaxyMap.set(clusterId, new ClusterDef(
      new Vector3(coordinate[0], coordinate[1], coordinate[2]),
      sectorsMap,
      ownership
    ));
  }
  parsedMap = galaxyMap;
  return parsedMap;
}
