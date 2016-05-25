#! /usr/bin/env node
var program = require('commander');

var checkDbConfig = function() {
  return true;
}

var initDbConfig = function() {
  console.log('todo init config');
}

program.version('1.0.0')
  .arguments('[command]')
  .action(function(cmd) {
    if (cmd !== 'config') {
      console.log('*** ERROR *** Command is one of: config');
      process.exit(1);
    }
    initDbConfig();
  })
  .option('-i, --init <application>', 'application name: ideman, ideman-acl')
  .option('-f, --force', 'using drop table')
  .parse(process.argv);

var configExists = checkDbConfig();
if (configExists === false) {
  initDbConfig();
}

if (program.init) {
  switch (program.init) {
    case 'ideman':
      console.log(program.init);
      break;
    case 'ideman-acl':
      console.log(program.init);
      break;
    default:
      console.log('*** ERROR *** Application must be one of: ideman, ideman-acl');
      process.exit(1);
      break;
  }
}
