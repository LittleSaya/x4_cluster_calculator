import { HabitatModule } from './HabitatModule'
import { ProductionModule } from './ProductionModule'
import { StorageModule } from './StorageModule'

export class FactoryData {

  name: string;

  habitatModules: Array<HabitatModule>;

  productionModules: Array<ProductionModule>;

  storageModules: Array<StorageModule>;

  constructor (name: string) {
    this.name = name;
    this.habitatModules = [];
    this.productionModules = [];
    this.storageModules = [];
  }
}
