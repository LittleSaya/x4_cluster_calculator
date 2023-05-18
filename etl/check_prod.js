const fs = require('fs');
const path = require('path');
const constants = require('./constants');

const fullWares = JSON.parse(fs.readFileSync(path.join(constants.WARES_SAVE_CONVERTED, 'full-wares.json'), 'utf-8'));
const fullModules = JSON.parse(fs.readFileSync(path.join(constants.STRUCT_SAVE_CONVERTED, 'full-modules.json'), 'utf-8'));
// const fullWares = JSON.parse(fs.readFileSync('../data_manually_modified/full-wares-manually.json'), 'utf-8');
// const fullModules = JSON.parse(fs.readFileSync('../data_manually_modified/full-modules-manually.json'), 'utf-8');

console.log('检查每一个生产模块的每一个产品的每一个生产方式是否都能够在货物信息中找到......')

let hasMissingWares = false;
for (const moduleId in fullModules.production) {
  const module = fullModules.production[moduleId];
  for (const pq of module.production_queue) {
    if (!pq.method) {
      pq.method = 'default';
    }
    const ware = fullWares[pq.ware];
    if (!ware) {
      console.log(`模块 ${moduleId} 以 ${pq.method} 方式生产 ${pq.ware} ，但是货物数据中未找到该货物`);
      hasMissingWares = true;
      continue;
    }
    if (!ware.production[pq.method]) {
      console.log(`模块 ${moduleId} 以 ${pq.method} 方式生产 ${pq.ware} ，但是货物数据中该货物没有该生产方式`);
      hasMissingWares = true;
      continue;
    }
  }
}

if (!hasMissingWares) {
  console.log('所有模块的所有产品的所有生产方式均能在货物信息中找到');
}
