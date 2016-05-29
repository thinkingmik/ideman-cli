#! /usr/bin/env node
var _ = require('underscore');
var program = require('commander');
var Configuration = require('./configuration')('./config.json');
var Promise = require('bluebird');
var create = require('./scripts/createTables');
var drop = require('./scripts/dropTables');
var cryptoManager = require('./utils/cryptoManager');
var inquirer = require('inquirer');
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
    if (settings) {
      printSuccess(settings);
      process.exit(0);
    }
    else {
      printError('No config found');
      process.exit(1);
    }
  }
  else if (arg === 'env') {
    var envName = Configuration.getEnvironment();
    printSuccess(envName);
    process.exit(0);
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

var initOption = function(val, force) {
  var prompt = inquirer.createPromptModule();
  var initQuestions = [
    {
      type: 'confirm',
      name: 'drop',
      message: 'Are you sure to drop all tables',
      default: false
    }
  ];
  prompt(initQuestions)
    .then(function(key, value) {
      if (!key.drop) {
        printSuccess('No tables dropped');
        process.exit(0);
      }
      switch (val) {
        case 'ideman':
          var promise = Promise.resolve(true);
          if (force) {
            promise = drop.idemanTables();
          }
          promise
            .then(function() {
              return create.userTable();
            })
            .then(function() {
              return create.idemanTables();
            })
            .then(function() {
              printSuccess('Jobs completed');
              process.exit(0);
            })
            .catch(function(err) {
              printError(err.message);
              process.exit(1);
            });
          break;
        case 'ideman-acl':
          var promise = Promise.resolve(true);
          if (force) {
            promise = drop.idemanTables();
          }
          promise
            .then(function() {
              return create.userTable();
            })
            .then(function() {
              return create.idemanAclTables();
            })
            .then(function() {
              printSuccess('Jobs completed');
              process.exit(0);
            })
            .catch(function(err) {
              printError(err.message);
              process.exit(1);
            });
          break;
        default:
          var config = Configuration.getConfig();
          if (!config.applications || config.applications.length === 0) {
            printError('No applications configured');
            process.exit(1);
          }
          var idemanApp = _.contains(config.applications, 'ideman');
          var idemanAclApp = _.contains(config.applications, 'ideman-acl');
          var promise = Promise.resolve(true);
          if (force) {
            promise = drop.idemanTables();
          }
          promise
            .then(function() {
              return create.userTable();
            })
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
              printSuccess('Jobs completed');
              process.exit(0);
            })
            .catch(function(err) {
              printError(err.message);
              process.exit(1);
            });
          break;
      }
    })
    .catch(function(err) {
      printError(err.message);
      process.exit(1);
    });
}

var encodeOption = function() {
  var prompt = inquirer.createPromptModule();
  var config = Configuration.getConfig();
  var initQuestions = [
    {
      type: 'input',
      name: 'cryptoKey',
      message: 'Secret cypher key',
      default: config.crypto.key || 'o!rDE(Qbrq7u4OV'
    },
    {
      type: 'input',
      name: 'cryptoInputEnc',
      message: 'Input encoding',
      default: config.crypto.inputEncoding || 'utf8'
    },
    {
      type: 'input',
      name: 'cryptoOutputEnc',
      message: 'Output encoding',
      default: config.crypto.outputEncoding || 'base64'
    },
    {
      type: 'input',
      name: 'password',
      message: 'Text to cypher'
    }
  ];
  prompt(initQuestions)
    .then(function(key, value) {
      return cryptoManager.cypher(key.password, key.cryptoKey, key.cryptoInputEnc, key.cryptoOutputEnc)
        .then(function(ret) {
          printSuccess(ret);
          process.exit(0);
        })
    })
    .catch(function(err) {
      printError(err.message);
      process.exit(1);
    });
}

var decodeOption = function() {
  var prompt = inquirer.createPromptModule();
  var config = Configuration.getConfig();
  var initQuestions = [
    {
      type: 'input',
      name: 'cryptoKey',
      message: 'Secret cypher key',
      default: config.crypto.key || 'o!rDE(Qbrq7u4OV'
    },
    {
      type: 'input',
      name: 'cryptoInputEnc',
      message: 'Input encoding',
      default: config.crypto.outputEncoding || 'base64'
    },
    {
      type: 'input',
      name: 'cryptoOutputEnc',
      message: 'Output encoding',
      default: config.crypto.inputEncoding || 'utf8'
    },
    {
      type: 'input',
      name: 'password',
      message: 'Text to decypher'
    }
  ];
  prompt(initQuestions)
    .then(function(key, value) {
      return cryptoManager.decypher(key.password, key.cryptoKey, key.cryptoInputEnc, key.cryptoOutputEnc)
        .then(function(ret) {
          printSuccess(ret);
          process.exit(0);
        })
    })
    .catch(function(err) {
      printError(err.message);
      process.exit(1);
    });
}

var manageOptions = function(program) {
  if (program.init) {
    initOption(program.init, program.force);
  }
  if (program.drop) {
    var prompt = inquirer.createPromptModule();
    var initQuestions = [
      {
        type: 'confirm',
        name: 'drop',
        message: 'Are you sure to drop all tables',
        default: false
      }
    ];
    prompt(initQuestions)
      .then(function(key, value) {
        if (key.drop) {
          return drop.idemanTables();
        }
        return null;
      })
      .then(function(ret) {
        if (!ret) {
          printSuccess('No tables dropped');
          process.exit(0);
        }
        printSuccess('Completed');
        process.exit(0);
      })
      .catch(function(err) {
        printError(err.message);
        process.exit(1);
      });
  }
  if (program.encode) {
    encodeOption();
  }
  if (program.decode) {
    decodeOption();
  }
  if (program.bcrypt) {
    var prompt = inquirer.createPromptModule();
    var initQuestions = [
      {
        type: 'input',
        name: 'password',
        message: 'Text to crypt'
      }
    ];
    prompt(initQuestions)
      .then(function(key, value) {
        return cryptoManager.crypt(key.password)
          .then(function(ret) {
            printSuccess(ret);
            process.exit(0);
          })
      })
      .catch(function(err) {
        printError(err.message);
        process.exit(1);
      });
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
  .option('-f, --force', 'uses drop table before init')
  .option('-d, --drop', 'drops all tables')
  .option('-e, --encode', 'cypher client password')
  .option('-x, --decode', 'decypher client password')
  .option('-b, --bcrypt', 'crypt user password')
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
