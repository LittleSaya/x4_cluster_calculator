/**
 * 以统一的方式去解析etl工具生成的模块数据文件
 */
import rawModuleData from '@/data_converted/full-modules.json'

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

export type ParsedModuleArray = {
  habitat: HabitatModule[],
  production: ProductionModule[],
  storage: StorageModule[],
};

export type ParsedModuleMap = {
  habitat: Map<string, HabitatModule>,
  production: Map<string, ProductionModule>,
  storage: Map<string, StorageModule>,
};

let parsedArray: ParsedModuleArray | undefined = undefined;
let parsedMap: ParsedModuleMap | undefined = undefined;

export function getParsedModuleArray (): ParsedModuleArray {
  if (parsedArray) {
    return parsedArray;
  }
  console.log('Parsing module data (return array)');

  const habitatModules: HabitatModule[] = [];
  const productionModules: ProductionModule[] = [];
  const storageModules: StorageModule[] = [];
  for (const moduleId in rawModuleData.habitat) {
    habitatModules.push({
      id: moduleId,
      name: rawModuleData.habitat[moduleId].name,
      race: rawModuleData.habitat[moduleId].race,
      capacity: rawModuleData.habitat[moduleId].capacity,
    });
  }
  for (const moduleId in rawModuleData.production) {
    productionModules.push({
      id: moduleId,
      name: rawModuleData.production[moduleId].name,
      productionQueue: rawModuleData.production[moduleId].production_queue.map(queue => ({
        ware: queue.ware,
        method: queue.method ? queue.method : 'default',
      })),
      maxWorkforce: rawModuleData.production[moduleId].max_workforce,
    });
  }
  for (const moduleId in rawModuleData.storage) {
    storageModules.push({
      id: moduleId,
      name: rawModuleData.storage[moduleId].name,
      cargo: {
        max: rawModuleData.storage[moduleId].cargo.max,
        tags: rawModuleData.storage[moduleId].cargo.tags,
      }
    });
  }
  parsedArray = {
    habitat: habitatModules,
    production: productionModules,
    storage: storageModules,
  };
  return parsedArray;
}

export function getParsedModuleMap (): ParsedModuleMap {
  if (parsedMap) {
    return parsedMap;
  }
  console.log('Parsing module data (return map)');
  
  const habitatModules: Map<string, HabitatModule> = new Map();
  const productionModules: Map<string, ProductionModule> = new Map();
  const storageModules: Map<string, StorageModule> = new Map();
  for (const moduleId in rawModuleData.habitat) {
    habitatModules.set(moduleId, {
      id: moduleId,
      name: rawModuleData.habitat[moduleId].name,
      race: rawModuleData.habitat[moduleId].race,
      capacity: rawModuleData.habitat[moduleId].capacity,
    });
  }
  for (const moduleId in rawModuleData.production) {
    productionModules.set(moduleId, {
      id: moduleId,
      name: rawModuleData.production[moduleId].name,
      productionQueue: rawModuleData.production[moduleId].production_queue.map(queue => ({
        ware: queue.ware,
        method: queue.method ? queue.method : 'default',
      })),
      maxWorkforce: rawModuleData.production[moduleId].max_workforce,
    });
  }
  for (const moduleId in rawModuleData.storage) {
    storageModules.set(moduleId, {
      id: moduleId,
      name: rawModuleData.storage[moduleId].name,
      cargo: {
        max: rawModuleData.storage[moduleId].cargo.max,
        tags: rawModuleData.storage[moduleId].cargo.tags,
      }
    });
  }
  parsedMap = {
    habitat: habitatModules,
    production: productionModules,
    storage: storageModules,
  };
  return parsedMap;
}
