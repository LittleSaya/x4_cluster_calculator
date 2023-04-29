cd %~dp0

node extract_files.js
node parse_t.js --save-intermediate
node parse_wares.js --save-intermediate
node parse_struct.js --save-intermediate
node parse_map.js --save-intermediate
