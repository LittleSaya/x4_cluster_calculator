const constants = require('./constants');
const path = require('path');
const l086 = require(path.join(constants.T_SAVE_CONVERTED, '0001-l086.json'));
const REG_TEXT = /{(\d+),(\d+)}/;

/**
 * @param {String} t 
 * @returns {String}
 */
function translate (t) {
  const reg_result = REG_TEXT.exec(t);
  if (!reg_result) {
    return t;
  }
  const page_id = reg_result[1];
  const t_id = reg_result[2];
  if (l086[page_id] === undefined || l086[page_id][t_id] === undefined) {
    throw new Error('fail to translate, can not find ' + reg_result[0]);
  }
  return translate(
    t.substring(0, reg_result.index) +
    l086[page_id][t_id] +
    t.substring(reg_result.index + reg_result[0].length)
  );
}

exports.translate = function (t) {
  try {
    const translated = translate(t);
    return translated.replace(/\(.+?\)/g, '');
  } catch (err) {
    console.error(err);
    return t;
  }
};
