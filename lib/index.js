#! /usr/bin/env node
var program = require('commander');
var Configuration = require('./configuration')('./config.json');
var Promise = require('bluebird');
var _ = require('underscore');
var create = require('./scripts/createTables');
var configLaunched = false;

var printError = function(msg) {
  console.error('*** ERROR *** %s', msg);
}

var printSuccess = function(msg) {
  console.log(msg);
}

var manageConfigArguments = function(arg, key) {
  if (!arg) {
    Configuration.initConfig()
      .then(function(ret) {
        printSuccess(ret);
      })
      .catch(function(err) {
        printError(err.message);
        process.exit(1);
      });
  }
  else if (arg === 'switch') {
    Configuration.switchEnvironment()
      .then(function(ret) {
        printSuccess(ret);
        process.exit(0);
      })
      .catch(function(err) {
        printError(err.message);
        process.exit(1);
      });
  }
  else if (arg === 'list') {
    var settings = Configuration.getConfig(key);
    if (!settings) {
      printSuccess(ret);
      process.exit(0);
    }
    else {
      printError('No config found');
      process.exit(1);
    }
  }
  else if (arg === 'delete') {
    Configuration.deleteConfig()
      .then(function(ret) {
        printSuccess(ret);
        process.exit(0);
      })
      .catch(function(err) {
        printError(err.message);
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
        var config = Configuration.getConfig();
        if (!config.applications || config.applications.length === 0) {
          printError('No applications configured');
          process.exit(1);
        }
        var idemanApp = _.contains(config.applications, 'ideman');
        var idemanAclApp = _.contains(config.applications, 'ideman-acl');
        create.userTable()
          .then(function() {
            if (idemanApp) {
              return create.idemanTables();
            }
          })
          .then(function() {
            if (idemanAclApp) {
              return create.idemanAclTables();
            }
          })
          .then(function() {
            printSuccess('Database initialization completed');
            process.exit(0);
          })
          .catch(function(err) {
            printError(err.message);
            process.exit(1);
          });
        break;
    }
  }
}

program.version('1.0.0')
  .arguments('[command] [argument] [key] [value]')
  .action(function(cmd, arg, key) {
    if (cmd === 'config') {
      manageConfigArguments(arg, key);
      configLaunched = true;
    }
    else {
      printError('Command must be one of: config');
      process.exit(1);
    }
  })
  .option('-i, --init [application]', 'application name')
  .option('-f, --force', 'using drop table')
  .parse(process.argv);

var configExists = Configuration.checkConfig();
if (configExists === false && configLaunched === false) {
  Configuration.initConfig()
    .then(function(ret) {
      manageOptions(program);
    })
    .catch(function(err) {
      printError(err.message);
      process.exit(1);
    });
}
else {
  manageOptions(program);
}
