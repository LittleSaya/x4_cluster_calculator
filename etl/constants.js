module.exports = {
  // DLC文件夹的名称
  EXTENSTIONS_DIR: 'extensions',
  BORON_DLC_DIR: 'ego_dlc_boron',
  PIRATE_DLC_DIR: 'ego_dlc_pirate',
  SPLIT_DLC_DIR: 'ego_dlc_split',
  TERRAN_DLC_DIR: 'ego_dlc_terran',

  // 匹配cat文件和dat文件的名称
  REG_CAT: /^([\d_a-zA-Z]+)\.cat$/,
  REG_DAT: /^([\d_a-zA-Z]+)\.dat$/,

  // 匹配cat文件中的一行
  REG_CAT_ROW: /^([a-zA-Z\d\s\-_()+',/\[\]\.]+\.[a-zA-Z\d]+) (\d+) (\d+) ([a-z\d]+)$/,

  // 匹配cat文件中与居住模块相关的行
  REG_STRUCT_HABITAT: /^assets\/structures\/habitat\/macros/,
  // 居住模块文件的存放位置
  STRUCT_HABITAT_SAVE_RAW: '../data_raw/assets_structures_habitat_macros',
  STRUCT_HABITAT_SAVE_INTERMEDIATE: '../data_intermediate/assets_structures_habitat_macros',

  // 匹配cat文件中与生产模块相关的行
  REG_STRUCT_PRODUCTION: /^assets\/structures\/production\/macros/,
  // 生产模块文件的存放位置
  STRUCT_PRODUCTION_SAVE_RAW: '../data_raw/assets_structures_production_macros',
  STRUCT_PRODUCTION_SAVE_INTERMEDIATE: '../data_intermediate/assets_structures_production_macros',
  
  // 匹配cat文件中与仓储模块相关的行
  REG_STRUCT_STORAGE: /^assets\/structures\/storage\/macros/,
  // 仓储模块文件的存放位置
  STRUCT_STORAGE_SAVE_RAW: '../data_raw/assets_structures_storage_macros',
  STRUCT_STORAGE_SAVE_INTERMEDIATE: '../data_intermediate/assets_structures_storage_macros',
  
  // 转换后的模块文件统一放在这里
  STRUCT_SAVE_CONVERTED: '../data_converted',
  
  // 匹配libraries/wares.xml文件（包括DLC）
  REG_WARES: /^libraries\/wares.xml$/,
  // wares.xml文件的存放位置
  WARES_SAVE_RAW: '../data_raw/wares',
  WARES_SAVE_INTERMEDIATE: '../data_intermediate/wares',
  WARES_SAVE_CONVERTED: '../data_converted',
  
  // 匹配语言文件
  REG_T: /^t\/\d{4}-l\d{3}.xml/,
  // 语言文件的存放位置
  T_SAVE_RAW: '../data_raw/t',
  T_SAVE_INTERMEDIATE: '../data_intermediate/t',
  T_SAVE_CONVERTED: '../data_converted/t',
  
  // 匹配地图（坐标信息）文件
  REG_MAP: /^maps\/xu_ep2_universe/,
  // 地图（坐标信息）文件的存放位置
  MAP_SAVE_RAW: '../data_raw/xu_ep2_universe',
  MAP_SAVE_INTERMEDIATE: '../data_intermediate/xu_ep2_universe',
  
  // 匹配地图（星区名称）文件
  REG_MAP_DEFAULTS: /^libraries\/mapdefaults.xml$/,
  // 地图（星区名称）文件的存放位置
  MAP_DEFAULTS_SAVE_RAW: '../data_raw/mapdefaults',
  MAP_DEFAULTS_SAVE_INTERMEDIATE: '../data_intermediate/mapdefaults',

  // 转换、合并后的地图文件统一放在这里
  MAP_SAVE_CONVERTED: '../data_converted',
}
