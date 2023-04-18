const constants = require('./constants');
const config = require('./config');
const fs = require('fs');
const path = require('path');

// 读取所有.cat文件，找到对应的.dat文件，并获取其中所有文件的位置和长度
const folders_to_scan = [
  path.join(config.GAME_DIR),
  path.join(config.GAME_DIR, constants.EXTENSTIONS_DIR, constants.BORON_DLC_DIR),
  path.join(config.GAME_DIR, constants.EXTENSTIONS_DIR, constants.SPLIT_DLC_DIR),
  path.join(config.GAME_DIR, constants.EXTENSTIONS_DIR, constants.TERRAN_DLC_DIR),
  path.join(config.GAME_DIR, constants.EXTENSTIONS_DIR, constants.PIRATE_DLC_DIR)
];

/** @type {{ file_name: String, dat_path: String, extension_number: Number, file_offset: Number, file_length: Number, timestamp: Number }[]} */
const file_catalog = [];

// for (const folder of folders_to_scan) {
for (let i_folder = 0; i_folder < folders_to_scan.length; ++i_folder) {
  const folder = folders_to_scan[i_folder];
  console.log(`reading folder ${folder}`);

  const file_names = fs.readdirSync(folder);
  for (const file_name of file_names) {
    const reg_cat_result = constants.REG_CAT.exec(file_name);
    if (reg_cat_result && file_name.toLowerCase().indexOf('sig') === -1) {
      console.log(`discover cat file ${file_name}`);

      const cat_file_content = fs.readFileSync(path.join(folder, file_name), 'utf-8').split('\n');
      /** @type {{ name: String, length: Number, offset: Number, timestamp: Number, sig: String }[]} */
      const parsed_file_content = [];
      let row_count = 0;
      for (const row of cat_file_content) {
        const reg_result_row = constants.REG_CAT_ROW.exec(row);
        if (!reg_result_row) {
          console.log(`${folder} ${file_name} ended at '${row}', rows read: ${row_count}`);
          break;
        }
        ++row_count;
        const temp = {
          name: reg_result_row[1],
          length: Number(reg_result_row[2]),
          offset: 0,
          timestamp: Number(reg_result_row[3]),
          sig: reg_result_row[4]
        };
        parsed_file_content.push(temp);
      }

      for (let i = 1; i < parsed_file_content.length; ++i) {
        parsed_file_content[i].offset = parsed_file_content[i - 1].offset + parsed_file_content[i - 1].length;
      }

      for (let parsed of parsed_file_content) {
        file_catalog.push({
          file_name: parsed.name,
          dat_path: path.join(folder, file_name.replace('.cat', '.dat')),
          file_length: parsed.length,
          file_offset: parsed.offset,
          timestamp: parsed.timestamp,
          sig: parsed.sig,
          extension_number: i_folder
        });
      }
    }
  }
}

// 先删除文件夹下的所有文件
console.log('clearing existing files...');
fs.rmSync(constants.STRUCT_HABITAT_SAVE, { force: true, recursive: true });
fs.mkdirSync(constants.STRUCT_HABITAT_SAVE);
fs.rmSync(constants.STRUCT_PRODUCTION_SAVE, { force: true, recursive: true });
fs.mkdirSync(constants.STRUCT_PRODUCTION_SAVE);
fs.rmSync(constants.STRUCT_STORAGE_SAVE, { force: true, recursive: true });
fs.mkdirSync(constants.STRUCT_STORAGE_SAVE);
fs.rmSync(constants.WARES_SAVE, { force: true, recursive: true });
fs.mkdirSync(constants.WARES_SAVE);
fs.rmSync(constants.T_SAVE, { force: true, recursive: true });
fs.mkdirSync(constants.T_SAVE);
fs.rmSync(constants.MAP_SAVE, { force: true, recursive: true });
fs.mkdirSync(constants.MAP_SAVE);
fs.rmSync(constants.MAP_DEFAULTS_SAVE, { force: true, recursive: true });
fs.mkdirSync(constants.MAP_DEFAULTS_SAVE);
console.log('success');

// 同一个扩展（本体的extension_number为0）中的同一个文件只取最新的那一个
const file_catalog_map = new Map();
for (const f of file_catalog) {
  let extension_map;
  if (file_catalog_map.has(f.extension_number)) {
    extension_map = file_catalog_map.get(f.extension_number);
    if (extension_map.has(f.file_name)) {
      const existing_file = extension_map.get(f.file_name);
      if (f.timestamp > existing_file.timestamp) {
        extension_map.set(f.file_name, f);
      }
    } else {
      extension_map.set(f.file_name, f);
    }
  } else {
    extension_map = new Map();
    extension_map.set(f.file_name, f);
    file_catalog_map.set(f.extension_number, extension_map);
  }
}

const newest_file_catalog = [];
file_catalog_map.forEach(v => v.forEach(v => newest_file_catalog.push(v)));

// 找到指定的文件，并将其提取、保存
// 先将file_catalog按dat_path整理一遍，一个dat文件只打开一次
/** @type { Object.<String, { file_name: String, file_offset: Number, file_length: Number }[]> } */
const sorted_file_catalog = {};
for (const cat of newest_file_catalog) {
  const datum = {
    file_name: cat.file_name,
    file_offset: cat.file_offset,
    file_length: cat.file_length
  };
  if (sorted_file_catalog[cat.dat_path]) {
    sorted_file_catalog[cat.dat_path].push(datum);
  } else {
    sorted_file_catalog[cat.dat_path] = [datum];
  }
}

let fdToClose = new Set();
let wares_count = 0;
let habitat_count = 0;
let production_count = 0;
let storage_count = 0;
let t_count = 0;
let galaxy_count = 0;
let cluster_count = 0;
let map_defaults_count = 0;
for (const dat_path in sorted_file_catalog) {
  const dat = sorted_file_catalog[dat_path];

  fdToClose.forEach(v => fs.closeSync(v));
  let fd = fs.openSync(dat_path);
  fdToClose.add(fd);

  for (const file of dat) {
    let buffer, bytes_read, save_to;

    if (constants.REG_STRUCT_HABITAT.test(file.file_name)) {
      save_to = path.join(constants.STRUCT_HABITAT_SAVE, path.basename(file.file_name));
      ++habitat_count;
    } else if (constants.REG_STRUCT_PRODUCTION.test(file.file_name)) {
      save_to = path.join(constants.STRUCT_PRODUCTION_SAVE, path.basename(file.file_name));
      ++production_count;
    } else if (constants.REG_STRUCT_STORAGE.test(file.file_name)) {
      save_to = path.join(constants.STRUCT_STORAGE_SAVE, path.basename(file.file_name));
      ++storage_count;
    } else if (constants.REG_WARES.test(file.file_name)) {
      save_to = path.join(constants.WARES_SAVE, '' + (++wares_count) + '_' + path.basename(file.file_name));
    } else if (constants.REG_T.test(file.file_name)) {
      save_to = path.join(constants.T_SAVE, path.basename(file.file_name));
      ++t_count;
    } else if (constants.REG_MAP.test(file.file_name)) {
      const base_name = path.basename(file.file_name);
      if (base_name === 'galaxy.xml') {
        save_to = path.join(constants.MAP_SAVE, '' + (++galaxy_count) + '_' + base_name);
      } else if (base_name.indexOf('clusters.xml') !== -1) {
        save_to = path.join(constants.MAP_SAVE, base_name);
        ++cluster_count;
      } else {
        // 跳过其他maps/xu_ep2_universe文件夹下的文件，对地图进行基本的可视化只需要galaxy和cluster两种文件
        continue;
      }
    } else if (constants.REG_MAP_DEFAULTS.test(file.file_name)) {
      save_to = path.join(constants.MAP_DEFAULTS_SAVE, '' + (++map_defaults_count) + '_' + path.basename(file.file_name));
    } else {
      continue;
    }

    buffer = Buffer.alloc(file.file_length, 0);
    bytes_read = fs.readSync(fd, buffer, 0, file.file_length, file.file_offset);

    if (bytes_read === file.file_length) {
      console.log('writing ' + file.file_name + ' in ' + dat_path + ' to ' + save_to + ' ......');
      fs.writeFileSync(save_to, buffer, { flag: 'w', mode: fs.constants.O_TRUNC });
      console.log('success');
    } else {
      console.log('fail to read ' + file.file_name + ' in ' + dat_path);
    }
  }
}
fdToClose.forEach(v => fs.closeSync(v));

console.log('wares_count = ' + wares_count);
console.log('habitat_count = ' + habitat_count);
console.log('production_count = ' + production_count);
console.log('storage_count = ' + storage_count);
console.log('t_count = ' + t_count);
console.log('galaxy_count = ' + galaxy_count);
console.log('cluster_count = ' + cluster_count);
console.log('map_defaults_count = ' + map_defaults_count);
