const { XMLParser } = require('fast-xml-parser');
const fs = require('fs');
const path = require('path');
const util = require('./util');
const constants = require('./constants');

const parser = new XMLParser({
  ignoreAttributes: false
});

const parsedModules = {
  habitat: {},
  production: {},
  storage: {}
};

let count_habitat = 0;
const habitat_macro_files = fs.readdirSync(constants.STRUCT_HABITAT_SAVE);
for (const habitat_macro_file of habitat_macro_files) {
  const habitat_macro_jobj = parser.parse(fs.readFileSync(path.join(constants.STRUCT_HABITAT_SAVE, habitat_macro_file), 'utf-8'));
  // console.log(JSON.stringify(habitat_macro_jobj, undefined, 2)); break;
  parsedModules.habitat[habitat_macro_jobj.macros.macro['@_name']] = {
    name: util.translate(habitat_macro_jobj.macros.macro.properties.identification['@_name']),
    race: habitat_macro_jobj.macros.macro.properties.workforce['@_race'],
    capacity: Number(habitat_macro_jobj.macros.macro.properties.workforce['@_capacity']),
  };
  ++count_habitat;
}
console.log('count_habitat = ' + count_habitat);

let count_production = 0;
const production_macro_files = fs.readdirSync(constants.STRUCT_PRODUCTION_SAVE);
for (const production_macro_file of production_macro_files) {
  const production_macro_jobj = parser.parse(fs.readFileSync(path.join(constants.STRUCT_PRODUCTION_SAVE, production_macro_file), 'utf-8'));
  // console.log(JSON.stringify(production_macro_jobj, undefined, 2)); break;
  // 跳过没有产品的工厂
  if (!production_macro_jobj.macros.macro.properties.production || !production_macro_jobj.macros.macro.properties.production.queue) {
    continue;
  }
  const queue = production_macro_jobj.macros.macro.properties.production.queue;
  parsedModules.production[production_macro_jobj.macros.macro['@_name']] = {
    name: util.translate(production_macro_jobj.macros.macro.properties.identification['@_name']),
    production_queue: Array.isArray(queue) ?
      queue.map(item => ({
        ware: item['@_ware'],
        method: item['@_method']
      })) :
      [{
        ware: queue['@_ware'],
        method: queue['@_method']
      }],
    max_workforce: Number(production_macro_jobj.macros.macro.properties.workforce['@_max'])
  };
  ++count_production;
}
console.log('count_production = ' + count_production);

let count_storage = 0;
const storage_macro_files = fs.readdirSync(constants.STRUCT_STORAGE_SAVE);
for (const storage_macro_file of storage_macro_files) {
  const storage_macro_jobj = parser.parse(fs.readFileSync(path.join(constants.STRUCT_STORAGE_SAVE, storage_macro_file), 'utf-8'));
  // console.log(JSON.stringify(storage_macro_jobj, undefined, 2)); break;
  parsedModules.storage[storage_macro_jobj.macros.macro['@_name']] = {
    name: util.translate(storage_macro_jobj.macros.macro.properties.identification['@_name']),
    cargo: {
      max: Number(storage_macro_jobj.macros.macro.properties.cargo['@_max']),
      tags: storage_macro_jobj.macros.macro.properties.cargo['@_tags']
    }
  };
  ++count_storage;
}
console.log('count_storage = ' + count_storage);

fs.writeFileSync('full-modules.json', JSON.stringify(parsedModules, undefined, 2));
