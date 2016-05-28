#! /usr/bin/env node
var program = require('commander');
var Configuration = require('./configuration')('./config.json');
var Promise = require('bluebird');
var configLaunch = false;

var printError = function(msg) {
  console.log('*** ERROR *** %s', msg);
}

var manageDbConfigArgument = function(arg, key) {
  if (!arg) {
    Configuration.initDbConfig()
      .then(function(ret) {
        console.log(ret);
      })
      .catch(function(err) {
        console.error(err.message);
        process.exit(1);
      });
  }
  else if (arg === 'switch') {
    Configuration.switchEnvironment()
      .then(function(ret) {
        console.log(ret);
        process.exit(0);
      })
      .catch(function(err) {
        console.error(err.message);
        process.exit(1);
      });
  }
  else if (arg === 'list') {
    var settings = Configuration.getDbConfig(key)
      .then(function(ret) {
        console.log(ret);
        process.exit(0);
      })
      .catch(function(msg) {
        console.error(msg);
        process.exit(1);
      });
  }
  else if (arg === 'delete') {
    Configuration.deleteDbConfig()
      .then(function(ret) {
        console.log(ret);
        process.exit(0);
      })
      .catch(function(err) {
        console.error(err.message);
        process.exit(1);
      });
  }
}

var manageOptions = function(program) {
  if (program.init) {
    switch (program.init) {
      case 'ideman':
        console.log(program.init);
        break;
      case 'ideman-acl':
        console.log(program.init);
        break;
      default:
        printError('Application must be one of: ideman, ideman-acl');
        process.exit(1);
        break;
    }
  }
}

program.version('1.0.0')
  .arguments('[command] [argument] [key]')
  .action(function(cmd, arg, key) {
    if (cmd === 'dbconfig') {
      manageDbConfigArgument(arg, key);
      configLaunch = true;
    }
    else {
      printError('Command must be one of: dbconfig');
      process.exit(1);
    }
  })
  .option('-i, --init <application>', 'application name: ideman, ideman-acl')
  .option('-f, --force', 'using drop table')
  .parse(process.argv);

var configExists = Configuration.checkDbConfig();
if (configExists === false && configLaunch === false) {
  Configuration.initDbConfig()
    .then(function(ret) {
      manageOptions(program);
    })
    .catch(function(err) {
      console.error(err.message);
      process.exit(1);
    });
}
else {
  manageOptions(program);
}
