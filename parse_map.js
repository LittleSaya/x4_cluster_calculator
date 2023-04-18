const { XMLParser } = require('fast-xml-parser');
const fs = require('fs');
const path = require('path');
const util = require('./util');
const constants = require('./constants');

const SAVE_MAP = false;
const SAVE_MAP_DEFAULTS = false;

const parser = new XMLParser({
  ignoreAttributes: false,
  isArray: (tagName, jPath, isLeafNode, isAttribute) => {
    switch (jPath) {
      case 'macros.macro':
      case 'macros.macro.connections.connection':
        return true;
    }
  }
});

// 读取文件
let main_galaxy_jobj, extra_galaxy_jobjs = [];
const cluster_jobjs = [];
const map_files = fs.readdirSync(constants.MAP_SAVE);
for (const map_file of map_files) {
  if (!map_file.endsWith('.xml')) {
    continue;
  }

  const jobj = parser.parse(fs.readFileSync(path.join(constants.MAP_SAVE, map_file), 'utf-8'));
  if (map_file.indexOf('galaxy.xml') !== -1) {
    if (jobj.macros) {
      main_galaxy_jobj = jobj;
    } else {
      extra_galaxy_jobjs.push(jobj);
    }
  } else if (map_file.indexOf('clusters.xml') !== -1) {
    cluster_jobjs.push(jobj);
  }
  if (SAVE_MAP) {
    fs.writeFileSync(path.join(constants.MAP_SAVE, map_file.replace('.xml', '.json')), JSON.stringify(jobj, undefined, 2));
  }
}

const mapdefaults_jobjs = [];
const mapdefaults_files = fs.readdirSync(constants.MAP_DEFAULTS_SAVE);
for (const mapdefaults_file of mapdefaults_files) {
  if (!mapdefaults_file.endsWith('.xml')) {
    continue;
  }

  const jobj = parser.parse(fs.readFileSync(path.join(constants.MAP_DEFAULTS_SAVE, mapdefaults_file), 'utf-8'));
  mapdefaults_jobjs.push(jobj);
  if (SAVE_MAP_DEFAULTS) {
    fs.writeFileSync(path.join(constants.MAP_DEFAULTS_SAVE, mapdefaults_file.replace('.xml', '.json')), JSON.stringify(jobj, undefined, 2));
  }
}

// 读取每一个cluster的ID和坐标，建立文件的基本框架
const REG_CLUSTER_NAME = /^(Cluster_\d+)_connection$/;
const parsed_map = {};
let cluster_count = 0;
function parse_galaxy_connection (connection) {
  const reg_cluster_name_result = REG_CLUSTER_NAME.exec(connection['@_name']);
  if (!reg_cluster_name_result) {
    return;
  }
  if (connection.offset && connection.offset.position) {
    parsed_map[reg_cluster_name_result[1]] = {
      coordinate: [
        Number(connection.offset.position['@_x']),
        Number(connection.offset.position['@_z']),
      ],
      sectors: {}
    };
  } else {
    // console.log('cluster at center: ' + reg_cluster_name_result[1]);
    parsed_map[reg_cluster_name_result[1]] = {
      coordinate: [
        0,
        0
      ],
      sectors: {}
    };
  }
  ++cluster_count;
}

for (const connection of main_galaxy_jobj.macros.macro[0].connections.connection) {
  parse_galaxy_connection(connection);
}
for (const extra_galaxy_jobj of extra_galaxy_jobjs) {
  for (const connection of extra_galaxy_jobj.diff.add.connection) {
    parse_galaxy_connection(connection);
  }
}

console.log('cluster_count = ' + cluster_count);

// 读取每一个sector的ID和坐标，填充sectors对象
const REG_SECTOR_NAME = /^(Cluster_\d+)_(Sector\d+)_connection$/;
let sector_count = 0;
function parse_cluster_connection (connection) {
  const reg_sector_name_result = REG_SECTOR_NAME.exec(connection['@_name']);
  if (!reg_sector_name_result) {
    return;
  }
  const cluster_id = reg_sector_name_result[1], sector_id = reg_sector_name_result[2];
  const full_sector_id = cluster_id + '_' + sector_id;
  if (!parsed_map[cluster_id]) {
    throw new Error(cluster_id + ' not exists in galaxy.xml, but exists in cluster.xml');
  }
  if (connection.offset && connection.offset.position) {
    parsed_map[cluster_id].sectors[full_sector_id] = {
      coordinate: [
        Number(connection.offset.position['@_x']),
        Number(connection.offset.position['@_z']),
      ]
    };
  } else {
    // console.log('sector at center: ' + full_sector_id);
    parsed_map[cluster_id].sectors[full_sector_id] = {
      coordinate: [
        0,
        0
      ]
    };
  }
  ++sector_count;
}

for (const cluster_jobj of cluster_jobjs) {
  for (const macro of cluster_jobj.macros.macro) {
    for (const connection of macro.connections.connection) {
      parse_cluster_connection(connection);
    }
  }
}

console.log('sector_count = ' + sector_count);

// 读取每一个sector的名称，填充每一个sector的name属性
const REG_MAPDEFAULTS_SECTOR_NAME = /^((Cluster_\d+)_Sector\d+)_macro$/;
let count_sector_with_name = 0;
for (const mapdefaults_jobj of mapdefaults_jobjs) {
  for (const dataset of mapdefaults_jobj.defaults.dataset) {
    const reg_mapdefaults_sector_name_result = REG_MAPDEFAULTS_SECTOR_NAME.exec(dataset['@_macro']);
    if (!reg_mapdefaults_sector_name_result) {
      continue;
    }
    const cluster_id = reg_mapdefaults_sector_name_result[2];
    const full_sector_id = reg_mapdefaults_sector_name_result[1];
    parsed_map[cluster_id].sectors[full_sector_id].name = util.translate(dataset.properties.identification['@_name']);
    ++count_sector_with_name;
  }
}

console.log('count_sector_with_name = ' + count_sector_with_name);

fs.writeFileSync('./full-map.json', JSON.stringify(parsed_map, undefined, 2));
