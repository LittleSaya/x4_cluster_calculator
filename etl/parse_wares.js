const { XMLParser } = require('fast-xml-parser');
const fs = require('fs');
const path = require('path');
const util = require('./util');
const constants = require('./constants');

fs.rmSync(constants.WARES_SAVE_INTERMEDIATE, { recursive: true, force: true });
fs.mkdirSync(constants.WARES_SAVE_INTERMEDIATE);
fs.rmSync(path.join(constants.WARES_SAVE_CONVERTED, 'full-wares.json'), { force: true });

const SAVE_INTERMEDIATE = process.argv.includes('--save-intermediate');

const SAVE_WARES_JSON = SAVE_INTERMEDIATE;
const SAVE_MAIN_WARES = false; // 是否单独保存一份游戏本体（无DLC）的货物

const parser = new XMLParser({
  ignoreAttributes: false,
  isArray: (tagName, jPath, isLeafNode, isAttribute) => {
    switch (jPath) {
      case 'wares.ware.production':
      case 'wares.ware.production.effects.effect':
      case 'wares.ware.production.primary.ware':
      case 'diff.add.ware.production':
      case 'diff.add.ware.production.effects.effect':
      case 'diff.add.ware.production.primary.ware':
      case 'diff.add.production.effects.effect':
      case 'diff.add.production.primary.ware':
        return true;
    }
  }
});

const files = fs.readdirSync(constants.WARES_SAVE_RAW);
let mainWares, extraWares = [];
for (const file of files) {
  // 跳过开发过程中残留的json文件
  if (!file.endsWith('.xml')) {
    continue;
  }

  const jObj = parser.parse(fs.readFileSync(path.join(constants.WARES_SAVE_RAW, file), 'utf-8'));
  if (SAVE_WARES_JSON) {
    fs.writeFileSync(path.join(constants.WARES_SAVE_INTERMEDIATE, file.replace('.xml', '.json')), JSON.stringify(jObj, undefined, 2));
  }

  if (jObj.wares) {
    mainWares = jObj;
  } else {
    extraWares.push(jObj);
  }
}

function parseProduction (production, wareId) {
  const parsedProduction = {
    time: Number(production['@_time']),
    amount: Number(production['@_amount']),
    effect: undefined,
    input: undefined
  };

  if (production.effects && production.effects.effect) {
    parsedProduction.effect = {};
    for (const effect of production.effects.effect) {
      parsedProduction.effect[effect['@_type']] = Number(effect['@_product']);
    }
  }
  if (wareId === 'energycells') {
    // 对能量电池，只考虑effect，不考虑input，能量电池不消耗原材料
    return parsedProduction;
  }

  parsedProduction.input = {};
  for (const inputWare of production.primary.ware) {
    parsedProduction.input[inputWare['@_ware']] = Number(inputWare['@_amount']);
  }

  return parsedProduction;
}

function parseWare (ware) {
  // ware：货物基本信息
  const parsedWare = {
    name: util.translate(ware['@_name']),
    transport: ware['@_transport'],
    volume: Number(ware['@_volume']),
    group: ware['@_group'],
    price: {
      min: ware.price['@_min'],
      average: ware.price['@_average'],
      max: ware.price['@_max']
    },
    production: undefined
  };

  // 没有生产方式，无法生产，应该是矿物
  if (!ware.production) {
    return parsedWare;
  } else {
    parsedWare.production = {};
  }

  // production：生产方式
  try {
    for (const production of ware.production) {
      parsedWare.production[production['@_method']] = parseProduction(production, ware['@_id']);
    }
  } catch (err) {
    console.log(JSON.stringify(ware, undefined, 2));
    throw err;
  }
  return parsedWare;
}

function isWareTagValid (tag) {
  if (tag) {
    if (tag.indexOf('economy') >= 0) {
      return true;
    } else if (tag.indexOf('workunit') >= 0) {
      return true;
    }
  }
  return false;
}

// mainWare：基本的货物信息
const parsedWares = {};
for (const ware of mainWares.wares.ware) {
  // 只考虑经济相关的货物和人力
  if (!isWareTagValid(ware['@_tags'])) {
    continue;
  }
  parsedWares[ware['@_id']] = parseWare(ware);
}

if (SAVE_MAIN_WARES) {
  fs.writeFileSync('./main-wares.json', JSON.stringify(parsedWares, undefined, 2));
}

// DLC里的货物
for (const _extraWares of extraWares) {
  for (const add of _extraWares.diff.add) {
    if (add['@_sel'] === '/wares') {
      // 新增货物
      for (const ware of add.ware) {
        if (!isWareTagValid(ware['@_tags'])) {
          continue;
        }
        parsedWares[ware['@_id']] = parseWare(ware);
      }
    } else if (/^\/wares\/ware\[@id='([a-zA-Z\d_]+)'\]$/.test(add['@_sel'])) {
      // 新增货物属性
      const sel_reg_result = /^\/wares\/ware\[@id='([a-zA-Z\d_]+)'\]$/.exec(add['@_sel']);
      const wareId = sel_reg_result[1];
      // 货物必须已经存在
      if (!parsedWares[wareId]) {
        continue;
      }
      if (add.production) {
        // 新增生产方式
        const parsedProduction = parseProduction(add.production, wareId);
        parsedWares[wareId].production[add.production['@_method']] = parsedProduction;
      }
    }
  }
}

fs.writeFileSync(path.join(constants.WARES_SAVE_CONVERTED, 'full-wares.json'), JSON.stringify(parsedWares, undefined, 2));
