#! /usr/bin/env node
var _ = require('underscore');
var program = require('commander');
var Configuration = require('./configuration');
var Automator = require('./automator');
var Promise = require('bluebird');
var create = require('./scripts/createTables');
var drop = require('./scripts/dropTables');
var cryptoManager = require('./utils/cryptoManager');
var inquirer = require('inquirer');

var printError = function(msg) {
  console.error('*** ERROR *** %s', msg);
}

var printSuccess = function(msg) {
  console.log(msg);
}

var manageConfigCmd = function() {
  Configuration.initConfig()
  .then(function(ret) {
    printSuccess(ret);
  })
  .catch(function(err) {
    printError(err.message);
    process.exit(1);
  });
}

var manageTablesCmd = function() {
  Configuration.initTables()
  .then(function(ret) {
    printSuccess(ret);
  })
  .catch(function(err) {
    printError(err.message);
    process.exit(1);
  });
}

var manageResetCmd = function() {
  Configuration.resetConfig()
  .then(function(ret) {
    printSuccess(ret);
    process.exit(0);
  })
  .catch(function(err) {
    printError(err.message);
    process.exit(1);
  });
}

var manageInitDbCmd = function (arg, force) {
  var prompt = inquirer.createPromptModule();
  var initQuestions = [];

  if (force) {
    initQuestions = [
      {
        type: 'confirm',
        name: 'drop',
        message: 'Are you sure to drop all tables',
        default: false
      }
    ];
  }

  prompt(initQuestions)
  .then(function(key, value) {
    if (key.drop === false) {
      printSuccess('No tables dropped');
      process.exit(0);
    }
    if (arg === 'ideman') {
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
        process.exit(0);
      })
      .catch(function(err) {
        printError(err.message);
        process.exit(1);
      });
    }
    else if (arg === 'ideman-cli') {
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
        process.exit(0);
      })
      .catch(function(err) {
        printError(err.message);
        process.exit(1);
      });
    }
    else {
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
        process.exit(0);
      })
      .catch(function(err) {
        printError(err.message);
        process.exit(1);
      });
    }
  })
  .catch(function(err) {
    printError(err.message);
    process.exit(1);
  });
}

var manageListCmd = function(arg) {
  var settings = Configuration.getConfig(arg);
  if (settings) {
    printSuccess(settings);
    process.exit(0);
  }
  else {
    printError('No config found');
    process.exit(1);
  }
}

var manageDropDbCmd = function () {
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
    process.exit(0);
  })
  .catch(function(err) {
    printError(err.message);
    process.exit(1);
  });
}

var manageEnvironmentCmd = function () {
  var envName = Configuration.getEnvironment();
  printSuccess(envName);
  process.exit(0);
}

var manageSwitchCmd = function () {
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

var manageCypherCmd = function () {
  var prompt = inquirer.createPromptModule();
  var config = Configuration.getConfig();
  var initQuestions = [
    {
      type: 'input',
      name: 'cryptoKey',
      message: 'Secret cypher key',
      default: config.crypto.key
    },
    {
      type: 'input',
      name: 'cryptoInputEnc',
      message: 'Input encoding',
      default: config.crypto.inputEncoding
    },
    {
      type: 'input',
      name: 'cryptoOutputEnc',
      message: 'Output encoding',
      default: config.crypto.outputEncoding
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

var manageDecypherCmd = function () {
  var prompt = inquirer.createPromptModule();
  var config = Configuration.getConfig();
  var initQuestions = [
    {
      type: 'input',
      name: 'cryptoKey',
      message: 'Secret cypher key',
      default: config.crypto.key
    },
    {
      type: 'input',
      name: 'cryptoInputEnc',
      message: 'Input encoding',
      default: config.crypto.outputEncoding
    },
    {
      type: 'input',
      name: 'cryptoOutputEnc',
      message: 'Output encoding',
      default: config.crypto.inputEncoding
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

var manageCryptCmd = function () {
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

var manageInsertCmd = function (arg) {
  if (arg === 'user') {
    var config = Configuration.getConfig();
    var automator = new Automator(config);
    automator.insertUser();
    /*
    .then(function(ret) {
      printSuccess(ret);
      process.exit(0);
    })
    .catch(function(err) {
      printError(err.message);
      process.exit(1);
    });*/
  }
}

program.version('1.0.0')
.arguments('<command> [argument] [key]')
.action(function(cmd, arg, key) {
  if (cmd === 'config') {
    manageConfigCmd();
  }
  else if (cmd === 'tables') {
    manageTablesCmd();
  }
  else if (cmd === 'reset') {
    manageResetCmd();
  }
  else if (cmd === 'init') {
    if (arg === 'force') {
      arg = null;
      key = true;
    }
    else if (arg !== 'force' && key === 'force') {
      key = true;
    }
    else {
      key = false;
    }
    if (Configuration.checkConfig()) {
      manageInitDbCmd(arg, key);
    }
    else {
      Configuration.initConfig()
      .then(function(ret) {
        manageInitDbCmd(arg, key);
      })
      .catch(function(err) {
        printError(err.message);
        process.exit(1);
      });
    }
  }
  else if (cmd === 'list') {
    manageListCmd(arg);
  }
  else if (cmd === 'drop') {
    manageDropDbCmd();
  }
  else if (cmd === 'env') {
    manageEnvironmentCmd();
  }
  else if (cmd === 'switch') {
    manageSwitchCmd();
  }
  else if (cmd === 'cypher') {
    manageCypherCmd();
  }
  else if (cmd === 'decypher') {
    manageDecypherCmd();
  }
  else if (cmd === 'crypt') {
    manageCryptCmd();
  }
  else if (cmd === 'insert') {
    if (Configuration.checkConfig()) {
      manageInsertCmd(arg);
    }
    else {
      Configuration.initConfig()
      .then(function(ret) {
        manageInsertCmd(arg);
      })
      .catch(function(err) {
        printError(err.message);
        process.exit(1);
      });
    }
  }
  else {
    printError('Command must be one of: config, tables, reset, init, list, env, switch, cypher, decypher, crypt');
    process.exit(1);
  }
})
.parse(process.argv);

if (!process.args) {

}
