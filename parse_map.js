const { XMLParser } = require('fast-xml-parser');
const fs = require('fs');
const path = require('path');
const util = require('./util');
const constants = require('./constants');

const SAVE_MAP = true;

const parser = new XMLParser({
  ignoreAttributes: false
});

// 解析cluster、sector及其坐标
const galaxy_jobjs = [];
const cluster_jobjs = [];
const map_files = fs.readdirSync(constants.MAP_SAVE);
for (const map_file of map_files) {
  const jobj = parser.parse(fs.readFileSync(path.join(constants.MAP_SAVE, map_file), 'utf-8'));
  if (map_file.indexOf('galaxy.xml') !== -1) {
    galaxy_jobjs.push(jobj);
  } else if (map_file.indexOf('clusters.xml') !== -1) {
    cluster_jobjs.push(jobj);
  }
  if (SAVE_MAP) {
    fs.writeFileSync(path.join(constants.MAP_SAVE, map_file.replace('.xml', '.json')), JSON.stringify(jobj, undefined, 2));
  }
}

// 解析cluster、sector的名称
