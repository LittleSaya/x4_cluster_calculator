export class FactoryData {

  name: string;

  habitatModules: string[];

  productionModules: string[];

  storageModules: string[];

  constructor (name: string) {
    this.name = name;
    this.habitatModules = [];
    this.productionModules = [];
    this.storageModules = [];
  }
}
