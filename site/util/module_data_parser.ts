/**
 * 以统一的方式去解析etl工具生成的模块数据文件
 */

export type HabitatModule = {
  id: string,
  name: string,
  race: string,
  capacity: number,
};

export type ProductionModule = {
  id: string,
  name: string,
  productionQueue: {
    ware: string,
    method: string,
  }[],
  maxWorkforce: number,
};

export type StorageModule = {
  id: string,
  name: string,
  cargo: {
    max: number,
    tags: string,
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
        method: queue.method,
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
