import fullMap from '../full-map.json'

export const COS_30 = Math.cos(Math.PI / 6);
export const COS_PI_6 = COS_30;
export const RE_COS_30 = 1 / COS_30;
export const RE_COS_PI_6 = RE_COS_30;

export const ORIGINAL_RESIZE_RATIO = 1e-4;

export const metadata = {
  ORIGINAL_RESIZE_RATIO,
  originalMapMinX: undefined,
  originalMapMaxX: undefined,
  originalMapMinZ: undefined,
  originalMapMaxZ: undefined,
  originalClusterRadius: undefined,
  mapMinX: undefined,
  mapMaxX: undefined,
  mapMinZ: undefined,
  mapMaxZ: undefined,
  clusterRadius: undefined,
  sectorRadius: undefined,
  exclusiveSectorRadius: undefined,
};

export function calculateMetadata () {
  metadata.originalMapMinX = Number.MAX_SAFE_INTEGER;
  metadata.originalMapMaxX = Number.MIN_SAFE_INTEGER;
  metadata.originalMapMinZ = Number.MAX_SAFE_INTEGER;
  metadata.originalMapMaxZ = Number.MIN_SAFE_INTEGER;

  for (const clusterId in fullMap) {
    const cluster = fullMap[clusterId];
    if (cluster.coordinate[0] < metadata.originalMapMinX) {
      metadata.originalMapMinX = cluster.coordinate[0];
    }
    if (cluster.coordinate[0] > metadata.originalMapMaxX) {
      metadata.originalMapMaxX = cluster.coordinate[0];
    }
    if (cluster.coordinate[2] < metadata.originalMapMinZ) {
      metadata.originalMapMinZ = cluster.coordinate[2];
    }
    if (cluster.coordinate[2] > metadata.originalMapMaxZ) {
      metadata.originalMapMaxZ = cluster.coordinate[2];
    }
  }

  metadata.mapMinX = metadata.originalMapMinX * ORIGINAL_RESIZE_RATIO;
  metadata.mapMaxX = metadata.originalMapMaxX * ORIGINAL_RESIZE_RATIO;
  metadata.mapMinZ = metadata.originalMapMinZ * ORIGINAL_RESIZE_RATIO;
  metadata.mapMaxZ = metadata.originalMapMaxZ * ORIGINAL_RESIZE_RATIO;

  // 使用Argon Prime和The Reach之间的距离计算originalClusterRadius
  // Cluster_14应该是Argon Prime
  // Cluster_07应该是The Reach
  if (
    fullMap['Cluster_14'].sectors['Cluster_14_Sector001'].name.toLowerCase().indexOf('argon prime') !== -1 &&
    fullMap['Cluster_07'].sectors['Cluster_07_Sector001'].name.toLowerCase().indexOf('the reach') !== -1
  ) {
    const argonPrimeCoordinate = fullMap['Cluster_14'].coordinate,
      theReachCoordinate = fullMap['Cluster_07'].coordinate;
    const x1 = argonPrimeCoordinate[0], z1 = argonPrimeCoordinate[2];
    const x2 = theReachCoordinate[0], z2 = theReachCoordinate[2];
    const distance = Math.sqrt((x1 - x2) * (x1 - x2) + (z1 - z2) * (z1 - z2));
    const radius = distance / 2 * RE_COS_30;
    metadata.originalClusterRadius = radius;
    metadata.clusterRadius = radius * ORIGINAL_RESIZE_RATIO;
    metadata.exclusiveSectorRadius = metadata.clusterRadius;
    metadata.sectorRadius = metadata.clusterRadius / 2;
  }

  console.log('metadata', metadata);
}
