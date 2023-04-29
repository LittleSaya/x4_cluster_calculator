const { XMLParser } = require("fast-xml-parser");
const fs = require('fs');
const path = require('path');
const constants = require('./constants');

fs.rmSync(constants.T_SAVE_INTERMEDIATE, { recursive: true, force: true });
fs.mkdirSync(constants.T_SAVE_INTERMEDIATE);
fs.rmSync(constants.T_SAVE_CONVERTED, { recursive: true, force: true });
fs.mkdirSync(constants.T_SAVE_CONVERTED);

const SAVE_INTERMEDIATE = process.argv.includes('--save-intermediate');

const t086 = fs.readFileSync(path.join(constants.T_SAVE_RAW, '0001-l086.xml'), 'utf-8');

const parser = new XMLParser({
  ignoreAttributes: false
});
let jObj = parser.parse(t086);

if (SAVE_INTERMEDIATE) {
  fs.writeFileSync(path.join(constants.T_SAVE_INTERMEDIATE, '0001-l086.json'), JSON.stringify(jObj, undefined, 2));
}

let json = {};

for (const page of jObj.language.page) {
  const ts = page.t;
  const page_id = page['@_id'];
  json[page_id] = {};
  if (Array.isArray(ts)) {
    for (const t of ts) {
      const text = t['#text'];
      const t_id = t['@_id'];
      json[page_id][t_id] = text;
    }
  } else {
    const t = ts;
    const text = t['#text'];
    const t_id = t['@_id'];
    json[page_id][t_id] = text;
  }
}

json = JSON.stringify(json, undefined, 4);
fs.writeFileSync(path.join(constants.T_SAVE_CONVERTED, '0001-l086.json'), json);
