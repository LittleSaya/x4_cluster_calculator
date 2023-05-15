/**
 * 场景中的对象类型，缩进代表了对象的上下级关系
 */
export enum ObjectUserDataType {
  Cluster,
  /* */ ClusterHexagonEdge,
  /* */ Sector,
  /*       */ SectorHexagonEdge,
  /*       */ SectorHexagonPlane,
  /*       */ SectorName,
  /*       */ Factory,
};
