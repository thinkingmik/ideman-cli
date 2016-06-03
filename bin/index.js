#! /usr/bin/env node
var _ = require('underscore');
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
        printSuccess('Tables created successfully');
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
        printSuccess('Tables created successfully');
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
    printSuccess(JSON.stringify(settings));
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
    printSuccess('Tables dropped successfully');
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

var manageImportCmd = function (filename) {
  var config = Configuration.getConfig();
  var automator = new Automator(config);
  automator.importData(filename)
  .then(function(ret) {
    printSuccess(ret);
    process.exit(0);
  })
  .catch(function(err) {
    printError(err.message);
    process.exit(1);
  });
}

var manageInsertCmd = function (arg) {
  var config = Configuration.getConfig();
  var automator = new Automator(config);
  var promise = null;
  if (arg === 'user') {
    promise = automator.getUserData();
  }
  else if (arg === 'client') {
    promise = automator.getClientData();
  }
  else if (arg === 'token') {
    promise = automator.getTokenData();
  }
  else if (arg === 'code') {
    promise = automator.getCodeData();
  }
  else if (arg === 'role') {
    promise = automator.getRoleData();
  }
  else if (arg === 'userRole') {
    promise = automator.getUserRoleData();
  }
  else if (arg === 'permission') {
    promise = automator.getPermissionData();
  }
  else if (arg === 'resource') {
    promise = automator.getResourceData();
  }
  else if (arg === 'policy') {
    promise = automator.getPolicyData();
  }
  else {
    printError('Unknown entity type ' + arg);
    process.exit(1);
  }
  if (promise) {
    promise
    .then(function(item) {
      return automator.insert(item.tablename, item.columns, item.returning);
    })
    .then(function(ret) {
      process.exit(0);
    })
    .catch(function(err) {
      printError(err.message);
      process.exit(1);
    });
  }
}

var manageDeleteCmd = function (arg) {
  var prompt = inquirer.createPromptModule();
  var config = Configuration.getConfig();
  var automator = new Automator(config);

  var secureQuestions = [
    {
      type: 'confirm',
      name: 'drop',
      message: 'Are you sure to delete all records',
      default: false
    }
  ];

  var entities = ['user', 'client', 'token', 'code', 'role', 'userRole', 'permission', 'resource', 'policy']
  if (!_.contains(entities, arg)) {
    printError('Unknown entity type ' + arg);
    process.exit(1);
  }

  automator.getClause(arg)
  .then(function(item) {
    if (!item.clause) {
      return prompt(secureQuestions)
      .then(function(key) {
        if (key.drop) {
          return item;
        }
        return null;
      });
    }
    return item;
  })
  .then(function(item) {
    if (!item) {
      printSuccess('No rows deleted');
      process.exit(0);
    }
    return automator.remove(item.tablename, item.clause, item.returning);
  })
  .then(function(ret) {
    printSuccess('Affected rows: ' + ret);
    process.exit(0);
  })
  .catch(function(err) {
    printError(err.message);
    process.exit(1);
  });
}

var args = process.argv.slice(2);
var cmd = args[0];
var arg1 = args[1] || null;
var arg2 = args[2] || null;
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
  if (arg1 === 'force') {
    arg1 = null;
    arg2 = true;
  }
  else if (arg1 !== 'force' && arg2 === 'force') {
    arg2 = true;
  }
  else {
    arg2 = false;
  }
  if (Configuration.checkConfig()) {
    manageInitDbCmd(arg1, arg2);
  }
  else {
    Configuration.initConfig()
    .then(function(ret) {
      manageInitDbCmd(arg1, arg2);
    })
    .catch(function(err) {
      printError(err.message);
      process.exit(1);
    });
  }
}
else if (cmd === 'list') {
  manageListCmd(arg1);
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
else if (cmd === 'import') {
  if (Configuration.checkConfig()) {
    manageImportCmd(arg1);
  }
  else {
    Configuration.initConfig()
    .then(function(ret) {
      manageImportCmd(arg1);
    })
    .catch(function(err) {
      printError(err.message);
      process.exit(1);
    });
  }
}
else if (cmd === 'insert') {
  if (Configuration.checkConfig()) {
    manageInsertCmd(arg1);
  }
  else {
    Configuration.initConfig()
    .then(function(ret) {
      manageInsertCmd(arg1);
    })
    .catch(function(err) {
      printError(err.message);
      process.exit(1);
    });
  }
}
else if (cmd === 'delete') {
  if (Configuration.checkConfig()) {
    manageDeleteCmd(arg1);
  }
  else {
    Configuration.initConfig()
    .then(function(ret) {
      manageDeleteCmd(arg1);
    })
    .catch(function(err) {
      printError(err.message);
      process.exit(1);
    });
  }
}
else {
  printError('Command must be one of: config, tables, reset, init, list, env, switch, insert, delete, import, cypher, decypher, crypt');
  process.exit(1);
}
