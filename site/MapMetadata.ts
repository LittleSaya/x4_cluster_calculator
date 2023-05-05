/**
 * 提供一系列关于地图尺寸的数据和常用的三角函数值
 */

import { ClusterId, ClusterDef } from './map_data_parser'

export const COS_30 = Math.cos(Math.PI / 6);
export const COS_PI_6 = COS_30;
export const RE_COS_30 = 1 / COS_30;
export const RE_COS_PI_6 = RE_COS_30;

export const RAW_RESIZE_RATIO = 1e-4;

export class MapMetadata {

  rawClusterRadius: number;

  /** 经过缩放后的cluster半径 */
  clusterRadius: number;

  /** 经过缩放后的sector半径（cluster内只有一个sector时） */
  sectorRadius1: number;

  /** 经过缩放后的sector半径（cluster内包含两个sector时） */
  sectorRadius2: number;

  /** 经过缩放后的sector半径（cluster内包含三个sector时） */
  sectorRadius3: number;

  constructor (galaxyMap: Map<ClusterId, ClusterDef>) {
    // 使用Argon Prime和The Reach之间的距离计算相邻两个cluster之间的（实际）距离
    // Cluster_14应该是Argon Prime
    // Cluster_07应该是The Reach
    const clusterId1 = 'Cluster_14', sectorId1 = 'Cluster_14_Sector001', clusterId2 = 'Cluster_07', sectorId2 = 'Cluster_07_Sector001';
    const cluster1 = galaxyMap.get(clusterId1), cluster2 = galaxyMap.get(clusterId2);
    if (!cluster1 || !cluster2) {
      throw new Error(`The constructor of '${MapMetadata.name}' requires parameter 'galaxyMap' contains key '${clusterId1}' and key '${clusterId2}'`);
    }
    const sector1 = cluster1.sectors.get(sectorId1), sector2 = cluster2.sectors.get(sectorId2);
    if (!sector1 || !sector2) {
      throw new Error(`The constructor of '${MapMetadata.name}' requires cluster '${clusterId1}' has sector '${sector1}, and cluster '${clusterId2} has sector '${sectorId2}'`);
    }
    if (
      sector1.name.toLowerCase().indexOf('argon prime') === -1 ||
      sector2.name.toLowerCase().indexOf('the reach') === -1
    ) {
      throw new Error(`The constructor of '${MapMetadata.name}' requires '${cluster1}' is 'argon prime' and '${cluster2}' is 'the reach'`);
    }
    const coordinate1 = cluster1.coordinate, coordinate2 = cluster2.coordinate;
    const distance = coordinate1.distanceTo(coordinate2)
    const radius = distance / 2 * RE_COS_30;
    this.rawClusterRadius = radius;
    this.clusterRadius = radius * RAW_RESIZE_RATIO;
    this.sectorRadius1 = this.clusterRadius;
    this.sectorRadius2 = this.sectorRadius3 = this.clusterRadius / 2;
  }
};
