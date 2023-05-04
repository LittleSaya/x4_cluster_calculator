/**
 * 提供一系列关于地图尺寸的数据
 */

import { ClusterId, ClusterDef } from './map_data_parser'

export class MapMetadata {

  clusterRadius: Number;

  sectorRadius1: Number;

  sectorRadius2: Number;

  sectorRadius3: Number;

  constructor (galaxyMap: Map<ClusterId, ClusterDef>) {
    // 使用Argon Prime和The Reach之间的距离计算相邻两个cluster之间的距离
    // Cluster_14应该是Argon Prime
    // Cluster_07应该是The Reach
    const key1 = 'Cluster_14', key2 = 'Cluster_07';
    const cluster14 = galaxyMap.get(key1), cluster07 = galaxyMap.get(key2);
    if (!cluster14 || !cluster07) {
      throw new Error(`The constructor of '${MapMetadata.name}' requires parameter 'galaxyMap' contains key '${key1}' and key '${key2}'`);
    }
    if (
      .sectors['Cluster_14_Sector001'].name.toLowerCase().indexOf('argon prime') !== -1 &&
      galaxyMap['Cluster_07'].sectors['Cluster_07_Sector001'].name.toLowerCase().indexOf('the reach') !== -1
    ) {
      const argonPrimeCoordinate = galaxyMap['Cluster_14'].coordinate,
        theReachCoordinate = galaxyMap['Cluster_07'].coordinate;
      const x1 = argonPrimeCoordinate[0], z1 = argonPrimeCoordinate[2];
      const x2 = theReachCoordinate[0], z2 = theReachCoordinate[2];
      const distance = Math.sqrt((x1 - x2) * (x1 - x2) + (z1 - z2) * (z1 - z2));
      const radius = distance / 2 * RE_COS_30;
      metadata.originalClusterRadius = radius;
      metadata.clusterRadius = radius * ORIGINAL_RESIZE_RATIO;
      metadata.exclusiveSectorRadius = metadata.clusterRadius;
      metadata.sectorRadius = metadata.clusterRadius / 2;
    }
  }
};
