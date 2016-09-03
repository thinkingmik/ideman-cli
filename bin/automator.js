var fs = require('fs');
var inquirer = require('inquirer');
var Promise = require('bluebird');
var cryptoManager = require('./utils/cryptoManager');
var Configuration = require('./configuration');

function Automator(config) {
  this._config = config;
  this._knex = null;
  if (this._config && this._config.database) {
    this._knex = require('knex')(this._config.database);
  }
}

Automator.prototype.importData = function(filename) {
  var self = this;
  return new Promise(function(resolve, reject) {
    try {
      var file = fs.readFileSync(filename, 'utf8');
      var content = JSON.parse(file.replace(/^\uFEFF/, ''));
      var items = content.data;
      if (content && items) {
        var insertAll = Promise.resolve(items).each(function(item) {
          var entity = item.entity;
          if (!self._config.tables.entities[entity]) {
            throw new Error('The ' + entity + ' entity does not exists');
          }
          var tablename = self._config.tables.prefix + self._config.tables.entities[entity].table;
          return self.insert(tablename, item.columns, item.returning);
        })
        .then(function(res) {
          return resolve('All data imported successfully');
        })
        .catch(function(err) {
          return reject(err);
        });
      }
      else {
        return resolve('No data to import');
      }
    }
    catch (err) {
      return reject(err);
    }
  });
}

Automator.prototype.insert = function(tablename, data, ret) {
  if (!ret) {
    ret = 'id';
  }
  return this._knex(tablename)
  .returning(ret)
  .insert(data)
  .then(function (res) {
    console.log('[INSERT] insert data into ' + tablename + ' table with result ' + ret + '=' + res);
    return res;
  });
}

Automator.prototype.update = function(tablename, clause, data, ret) {
  if (!ret) {
    ret = 'id';
  }
  return this._knex(tablename)
  .where(clause)
  .returning(ret)
  .update()
  .then(function (res) {
    console.log('[UPDATE] update data into ' + tablename + ' table where ' + JSON.stringify(clause));
    if (!res) {
      return 0;
    }
    else if (res instanceof Array) {
      return res.length;
    }
    else {
      return res;
    }
  });
}

Automator.prototype.remove = function(tablename, clause, ret) {
  if (!ret) {
    ret = 'id';
  }
  if (!clause) {
    clause = {};
  }
  return this._knex(tablename)
  .where(clause)
  .returning(ret)
  .del()
  .then(function (res) {
    console.log('[DELETE] delete data from ' + tablename + ' table where ' + JSON.stringify(clause));
    if (!res) {
      return 0;
    }
    else if (res instanceof Array) {
      return res.length;
    }
    else {
      return res;
    }
  });
}

Automator.prototype.getUserData = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var prompt = inquirer.createPromptModule();
    var initQuestions = [
      {
        type: 'input',
        name: 'username',
        message: 'Username'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password'
      },
      {
        type: 'input',
        name: 'email',
        message: 'Email'
      },
      {
        type: 'input',
        name: 'firstName',
        message: 'First name',
        default: 'null'
      },
      {
        type: 'input',
        name: 'lastName',
        message: 'Last name',
        default: 'null'
      },
      {
        type: 'list',
        name: 'enabled',
        message: 'Enabled',
        choices: [ 'true', 'false' ],
        default: 'true'
      }
    ];

    prompt(initQuestions)
    .then(function(key, value) {
      key.enabled = (key.enabled === 'true') ? 1 : 0;
      if (key.password) {
        var cmode = self._config.userPasswordEnc;
        if (cmode === 'bcrypt') {
          return cryptoManager
          .crypt(key.password)
          .then(function(hash) {
            key.password = hash;
            return key;
          });
        }
        else if (cmode === 'crypto') {
          return cryptoManager
          .cypher(key.password, self._config.crypto.key, self._config.crypto.inputEncoding, self._config.crypto.outputEncoding)
          .then(function(hash) {
            key.password = hash;
            return key;
          })
        }
        else {
          return key.password;
        }
      }
      return key;
    })
    .then(function(key) {
      var data = {
        tablename: self._config.tables.prefix + self._config.tables.entities.user.table,
        returning: 'id',
        columns: self.setNullValue(key)
      }
      return resolve(data);
    })
    .catch(function(err) {
      return reject(err);
    });
  });
}

Automator.prototype.getClientData = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var prompt = inquirer.createPromptModule();

    var initQuestions = [
      {
        type: 'input',
        name: 'name',
        message: 'Name'
      },
      {
        type: 'password',
        name: 'secret',
        message: 'Secret'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description',
        default: 'null'
      },
      {
        type: 'input',
        name: 'domain',
        message: 'Domain',
        default: 'null'
      },
      {
        type: 'list',
        name: 'enabled',
        message: 'Enabled',
        choices: [ 'true', 'false' ],
        default: 'true'
      }
    ];

    prompt(initQuestions)
    .then(function(key, value) {
      key.enabled = (key.enabled === 'true') ? 1 : 0;
      if (key.secret) {
        return cryptoManager
        .cypher(key.secret, self._config.crypto.key, self._config.crypto.inputEncoding, self._config.crypto.outputEncoding)
        .then(function(hash) {
          key.secret = hash;
          return key;
        });
      }
      return key;
    })
    .then(function(key) {
      var data = {
        tablename: self._config.tables.prefix + self._config.tables.entities.client.table,
        returning: 'id',
        columns: self.setNullValue(key)
      }
      return resolve(data);
    })
    .catch(function(err) {
      return reject(err);
    });
  });
}

Automator.prototype.getTokenData = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var prompt = inquirer.createPromptModule();

    var initQuestions = [
      {
        type: 'input',
        name: 'token',
        message: 'Access token'
      },
      {
        type: 'password',
        name: 'refresh',
        message: 'Refresh token',
        default: 'null'
      },
      {
        type: 'input',
        name: 'userAgent',
        message: 'Useragent',
        default: 'null'
      },
      {
        type: 'input',
        name: 'ipAddress',
        message: 'IP Address',
        default: 'null'
      },
      {
        type: 'input',
        name: 'userId',
        message: 'User ID',
        default: 'null'
      },
      {
        type: 'input',
        name: 'clientId',
        message: 'Client ID',
        default: 'null'
      }
    ];

    prompt(initQuestions)
    .then(function(key) {
      var data = {
        tablename: self._config.tables.prefix + self._config.tables.entities.token.table,
        returning: 'id',
        columns: self.setNullValue(key)
      }
      return resolve(data);
    })
    .catch(function(err) {
      return reject(err);
    });
  });
}

Automator.prototype.getCodeData = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var prompt = inquirer.createPromptModule();

    var initQuestions = [
      {
        type: 'input',
        name: 'code',
        message: 'Code'
      },
      {
        type: 'input',
        name: 'redirectUri',
        message: 'Redirect url',
        default: 'null'
      },
      {
        type: 'input',
        name: 'clientId',
        message: 'Client ID'
      }
    ];

    prompt(initQuestions)
    .then(function(key) {
      var data = {
        tablename: self._config.tables.prefix + self._config.tables.entities.code.table,
        returning: 'id',
        columns: self.setNullValue(key)
      }
      return resolve(data);
    })
    .catch(function(err) {
      return reject(err);
    });
  });
}

Automator.prototype.getRoleData = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var prompt = inquirer.createPromptModule();

    var initQuestions = [
      {
        type: 'input',
        name: 'name',
        message: 'Name'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description',
        default: 'null'
      },
      {
        type: 'list',
        name: 'enabled',
        message: 'Enabled',
        choices: [ 'true', 'false' ],
        default: 'true'
      }
    ];

    prompt(initQuestions)
    .then(function(key, value) {
      key.enabled = (key.enabled === 'true') ? 1 : 0;
      return key;
    })
    .then(function(key) {
      var data = {
        tablename: self._config.tables.prefix + self._config.tables.entities.role.table,
        returning: 'id',
        columns: self.setNullValue(key)
      }
      return resolve(data);
    })
    .catch(function(err) {
      return reject(err);
    });
  });
}

Automator.prototype.getUserRoleData = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var prompt = inquirer.createPromptModule();

    var initQuestions = [
      {
        type: 'input',
        name: 'activation',
        message: 'Activation date',
        default: 'null'
      },
      {
        type: 'input',
        name: 'expiration',
        message: 'Expiration date',
        default: 'null'
      },
      {
        type: 'list',
        name: 'main',
        message: 'Main role',
        choices: [ 'true', 'false' ],
        default: 'true'
      },
      {
        type: 'input',
        name: 'userId',
        message: 'User ID'
      },
      {
        type: 'input',
        name: 'roleId',
        message: 'Role ID'
      }
    ];

    prompt(initQuestions)
    .then(function(key, value) {
      key.main = (key.main === 'true') ? 1 : 0;
      return key;
    })
    .then(function(key) {
      var data = {
        tablename: self._config.tables.prefix + self._config.tables.entities.userRole.table,
        returning: 'id',
        columns: self.setNullValue(key)
      }
      return resolve(data);
    })
    .catch(function(err) {
      return reject(err);
    });
  });
}

Automator.prototype.getPermissionData = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var prompt = inquirer.createPromptModule();

    var initQuestions = [
      {
        type: 'input',
        name: 'id',
        message: 'Permission name'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description',
        default: 'null'
      }
    ];

    prompt(initQuestions)
    .then(function(key) {
      var data = {
        tablename: self._config.tables.prefix + self._config.tables.entities.permission.table,
        returning: 'id',
        columns: self.setNullValue(key)
      }
      return resolve(data);
    })
    .catch(function(err) {
      return reject(err);
    });
  });
}

Automator.prototype.getResourceData = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var prompt = inquirer.createPromptModule();

    var initQuestions = [
      {
        type: 'input',
        name: 'id',
        message: 'Resource name'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description',
        default: 'null'
      }
    ];

    prompt(initQuestions)
    .then(function(key) {
      var data = {
        tablename: self._config.tables.prefix + self._config.tables.entities.resource.table,
        returning: 'id',
        columns: self.setNullValue(key)
      }
      return resolve(data);
    })
    .catch(function(err) {
      return reject(err);
    });
  });
}

Automator.prototype.getPolicyData = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var prompt = inquirer.createPromptModule();

    var initQuestions = [
      {
        type: 'input',
        name: 'activation',
        message: 'Activation date',
        default: 'null'
      },
      {
        type: 'input',
        name: 'expiration',
        message: 'Expiration date',
        default: 'null'
      },
      {
        type: 'input',
        name: 'userId',
        message: 'User ID',
        default: 'null'
      },
      {
        type: 'input',
        name: 'roleId',
        message: 'Role ID',
        default: 'null'
      },
      {
        type: 'input',
        name: 'resourceId',
        message: 'Resource name'
      },
      {
        type: 'input',
        name: 'permissionId',
        message: 'Permission name'
      }
    ];

    prompt(initQuestions)
    .then(function(key) {
      var data = {
        tablename: self._config.tables.prefix + self._config.tables.entities.policy.table,
        returning: 'id',
        columns: self.setNullValue(key)
      }
      return resolve(data);
    })
    .catch(function(err) {
      return reject(err);
    });
  });
}

Automator.prototype.getClause = function(entity) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var prompt = inquirer.createPromptModule();
    var initQuestions = [
      {
        type: 'input',
        name: 'clause',
        message: 'Where clause { "<key>" : "<value>" }'
      }
    ];
    prompt(initQuestions)
    .then(function(key) {
      if (!key.clause) {
        key.clause = null;
      }
      return key;
    })
    .then(function(key) {
      var data = {
        tablename: self._config.tables.prefix + self._config.tables.entities[entity].table,
        returning: 'id',
        clause: (key.clause) ? JSON.parse(key.clause) : null
      }
      return resolve(data);
    })
    .catch(function(err) {
      return reject(err);
    });
  });
}

Automator.prototype.setNullValue = function(keys) {
  if (!keys) {
    return null;
  }
  for (var el in keys) {
    if (keys[el] == 'null' || keys[el] == 'NULL') {
      keys[el] = null;
    }
  }
  return keys;
}

exports = module.exports = Automator;
