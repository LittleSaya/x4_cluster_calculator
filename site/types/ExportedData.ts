import { Vector3 } from 'three';
import { FactoryData } from './FactoryData';

export type ExportedData = {
  sectorId: string,
  position: Vector3,
  factoryData: FactoryData,
}[];
