export class FactoryData {

  name: string;

  habitatModules: string[];

  productionModules: string[];

  storageModules: string[];

  currentWorkforce: number;

  bannedWaresIdArray: string[];

  constructor (name: string) {
    this.name = name;
    this.habitatModules = [];
    this.productionModules = [];
    this.storageModules = [];
    this.currentWorkforce = 0;
    this.bannedWaresIdArray = [];
  }
}
