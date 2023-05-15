import { ObjectUserDataType } from './ObjectUserDataType'
import { FactoryData } from './FactoryData'

export type ObjectUserData = {
  type: ObjectUserDataType.Cluster,
  ownership: string,
} | {
  type: ObjectUserDataType.Sector,
  ownership: string,

  /**
   * 星区的名称
   */
  name: string,

  /**
   * 缩放后的半径
  */
  radius: number,

  /**
   * 该星区内工厂方块的大小
   */
  factoryCubeSize: number,

  /**
   * 星区的id
   */
  id: string,
} | {
  type: ObjectUserDataType.ClusterHexagonEdge |
  ObjectUserDataType.SectorHexagonEdge |
  ObjectUserDataType.SectorHexagonPlane |
  ObjectUserDataType.SectorName
} | {
  type: ObjectUserDataType.Factory,
  factory: FactoryData,
};
