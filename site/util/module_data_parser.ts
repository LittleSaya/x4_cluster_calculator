/**
 * 以统一的方式去解析etl工具生成的模块数据文件
 */

export class Module {

  id: string;

  name: string;

  constructor (id: string, name: string) {
    this.id = id;
    this.name = name;
  }
};

export class HabitatModule extends Module {

  race: string;

  capacity: number;

  constructor (id: string, name: string, race: string, capacity: number) {
    super(id, name);
    this.race = race;
    this.capacity = capacity;
  }
};

export class ProductionModule extends Module {

  productionQueue: {
    ware: string,
    method: string,
  }[];

  maxWorkforce: number;

  constructor (id: string, name: string, productionQueue: { ware: string, method: string }[], maxWorkforce: number) {
    super(id, name);
    this.productionQueue = productionQueue;
    this.maxWorkforce = maxWorkforce;
  }
};

export class StorageModule extends Module {

  cargo: {
    max: number,
    tags: string,
  };

  constructor (id: string, name: string, cargo: { max: number, tags: string }) {
    super(id, name);
    this.cargo = cargo;
  }
};

export type AllModules = {
  habitat: HabitatModule[],
  production: ProductionModule[],
  storage: StorageModule[],
};

export function parseModuleData (json: any): AllModules {
  const habitatModules: HabitatModule[] = [];
  const productionModules: ProductionModule[] = [];
  const storageModules: StorageModule[] = [];
  for (const moduleId in json.habitat) {
    habitatModules.push({
      id: moduleId,
      name: json.habitat[moduleId].name,
      race: json.habitat[moduleId].race,
      capacity: json.habitat[moduleId].capacity,
    });
  }
  for (const moduleId in json.production) {
    productionModules.push({
      id: moduleId,
      name: json.production[moduleId].name,
      productionQueue: json.production[moduleId].production_queue.map(queue => ({
        ware: queue.ware,
        method: queue.method ? queue.method : 'default',
      })),
      maxWorkforce: json.production[moduleId].max_workforce,
    });
  }
  for (const moduleId in json.storage) {
    storageModules.push({
      id: moduleId,
      name: json.storage[moduleId].name,
      cargo: {
        max: json.storage[moduleId].cargo.max,
        tags: json.storage[moduleId].cargo.tags,
      }
    });
  }
  return {
    habitat: habitatModules,
    production: productionModules,
    storage: storageModules,
  };
}
