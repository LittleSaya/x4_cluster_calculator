export class FactoryData {

  name: string;

  habitatModules: string[];

  productionModules: string[];

  storageModules: string[];

  currentWorkforce: number;

  constructor (name: string) {
    this.name = name;
    this.habitatModules = [];
    this.productionModules = [];
    this.storageModules = [];
    this.currentWorkforce = 0;
  }
}
