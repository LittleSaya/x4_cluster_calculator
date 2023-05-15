import { Vector3 } from 'three';
import { FactoryData } from './FactoryData';

export type ExportedDatum = {
  sectorId: string,
  position: Vector3,
  factoryData: FactoryData,
};

export type ExportedData = ExportedDatum[];
