var _ = require('lodash');
var fs = require('fs');
var nconf = require('nconf');
var inquirer = require('inquirer');
var Promise = require('bluebird');

function Configuration() {
  this._file = __dirname + '/configs/config.json';
  nconf.env().argv();
  nconf.file(this._file);
  this._environment = nconf.get('current') || 'development';
}

Configuration.prototype.getEnvironment = function() {
  return this._environment;
}

Configuration.prototype.switchEnvironment = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var prompt = inquirer.createPromptModule();

    var initQuestions = [
      {
        type: 'list',
        name: 'environment',
        message: 'Switch environment to',
        choices: [
          'development',
          'production'
        ],
        default: self._environment
      }
    ];

    prompt(initQuestions)
    .then(function(key, value) {
      this._environment = key.environment;
      nconf.set('current', this._environment);
      nconf.save(function (err) {
        if (err) {
          console.error(err.message);
          return;
        }
        return resolve('Switched config environment from ' + self._environment + ' to ' + this._environment);
      });
    })
    .catch(function(err) {
      return reject(err);
    });
  });
}

Configuration.prototype.initConfig = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var prompt = inquirer.createPromptModule();

    var apps = nconf.get(self._environment + ':applications');
    var idemanApp = _.includes(apps, 'ideman');
    var idemanAclApp = _.includes(apps, 'ideman-acl');

    var initQuestions = [
      {
        type: 'list',
        name: 'environment',
        message: 'Environment',
        choices: [
          'development',
          'production'
        ],
        default: self._environment
      },
      {
        type: 'checkbox',
        name: 'applications',
        message: 'Which applications do you want manage',
        choices: [
          {
            name: "ideman",
            checked: idemanApp
          },
          {
            name: "ideman-acl",
            checked: idemanAclApp
          }
        ]
      },
      {
        type: 'list',
        name: 'userPasswordEnc',
        message: 'Users password cryptation',
        choices: [
          'bcrypt',
          'crypto',
          'none'
        ],
        default: nconf.get(self._environment + ':userPasswordEnc')
      },
      {
        type: 'input',
        name: 'cryptoKey',
        message: 'Secret cipher key',
        default: nconf.get(self._environment + ':crypto:key')
      },
      {
        type: 'input',
        name: 'cryptoAlgorithm',
        message: 'Cipher algorithm',
        default: nconf.get(self._environment + ':crypto:algorithm')
      },
      {
        type: 'input',
        name: 'cryptoInputEnc',
        message: 'Input encoding for text cipher',
        default: nconf.get(self._environment + ':crypto:inputEncoding')
      },
      {
        type: 'input',
        name: 'cryptoOutputEnc',
        message: 'Output encoding for text cipher',
        default: nconf.get(self._environment + ':crypto:outputEncoding')
      },
      {
        type: 'list',
        name: 'dbclient',
        message: 'DB client',
        choices: [
          'pg',
          'mysql',
          'mariasql',
          'sqlite3'
        ],
        default: nconf.get(self._environment + ':database:client')
      }
    ];

    prompt(initQuestions)
    .then(function(key, value) {
      this._environment = key.environment;
      nconf.set('current', this._environment);
      nconf.set(this._environment + ':applications', key.applications);
      nconf.set(this._environment + ':userPasswordEnc', key.userPasswordEnc);
      nconf.set(this._environment + ':crypto:key', key.cryptoKey.trim());
      nconf.set(this._environment + ':crypto:algorithm', key.cryptoAlgorithm.trim());
      nconf.set(this._environment + ':crypto:inputEncoding', key.cryptoInputEnc.trim());
      nconf.set(this._environment + ':crypto:outputEncoding', key.cryptoOutputEnc.trim());

      var connection = nconf.get(this._environment + ':database:connection');
      var pgQuestions = [
        {
          type: 'input',
          name: 'connstring',
          message: 'Connection string',
          default: (connection instanceof Object) ? null : connection
        }
      ];

      var sqliteQuestions = [
        {
          type: 'input',
          name: 'filename',
          message: 'File name',
          default: nconf.get(this._environment + ':database:connection:filename')
        }
      ];

      var mysqlQuestions = [
        {
          type: 'input',
          name: 'host',
          message: 'Host',
          default: nconf.get(this._environment + ':database:connection:host')
        },
        {
          type: 'input',
          name: 'username',
          message: 'User',
          default: nconf.get(this._environment + ':database:connection:user')
        },
        {
          type: 'password',
          name: 'password',
          message: 'Password',
          default: nconf.get(this._environment + ':database:connection:password')
        },
        {
          type: 'input',
          name: 'database',
          message: 'Database',
          default: nconf.get(this._environment + ':database:connection:database')
        }
      ];

      var mariasqlQuestions = [
        {
          type: 'input',
          name: 'host',
          message: 'Host',
          default: nconf.get(this._environment + ':database:connection:host')
        },
        {
          type: 'input',
          name: 'username',
          message: 'User',
          default: nconf.get(this._environment + ':database:connection:user')
        },
        {
          type: 'password',
          name: 'password',
          message: 'Password',
          default: nconf.get(this._environment + ':database:connection:password')
        },
        {
          type: 'input',
          name: 'db',
          message: 'Database',
          default: nconf.get(this._environment + ':database:connection:db')
        }
      ];

      if (key.dbclient === 'pg') {
        nconf.set(this._environment + ':database:client', key.dbclient);
        nconf.set(this._environment + ':database:useNullAsDefault', true);
        return prompt(pgQuestions)
        .then(function(key, value) {
          nconf.set(this._environment + ':database:connection', key.connstring.trim());
        });
      }
      else if (key.dbclient === 'mysql') {
        nconf.set(this._environment + ':database:client', key.dbclient);
        nconf.set(this._environment + ':database:useNullAsDefault', true);
        return prompt(mysqlQuestions)
        .then(function(key, value) {
          nconf.set(this._environment + ':database:connection:host', key.host.trim());
          nconf.set(this._environment + ':database:connection:user', key.username.trim());
          nconf.set(this._environment + ':database:connection:password', key.password.trim());
          nconf.set(this._environment + ':database:connection:database', key.database.trim());
          nconf.set(this._environment + ':database:connection:db', null);
          nconf.set(this._environment + ':database:connection:filename', null);
        });
      }
      else if (key.dbclient === 'mariasql') {
        nconf.set(this._environment + ':database:client', key.dbclient);
        nconf.set(this._environment + ':database:useNullAsDefault', true);
        return prompt(mariasqlQuestions)
        .then(function(key, value) {
          nconf.set(this._environment + ':database:connection:host', key.host.trim());
          nconf.set(this._environment + ':database:connection:user', key.username.trim());
          nconf.set(this._environment + ':database:connection:password', key.password.trim());
          nconf.set(this._environment + ':database:connection:database', null);
          nconf.set(this._environment + ':database:connection:db', key.db.trim());
          nconf.set(this._environment + ':database:connection:filename', null);
        });
      }
      else if (key.dbclient === 'sqlite3') {
        nconf.set(this._environment + ':database:client', key.dbclient);
        nconf.set(this._environment + ':database:useNullAsDefault', true);
        return prompt(sqliteQuestions)
        .then(function(key, value) {
          nconf.set(this._environment + ':database:connection:host', null);
          nconf.set(this._environment + ':database:connection:user', null);
          nconf.set(this._environment + ':database:connection:password', null);
          nconf.set(this._environment + ':database:connection:database', null);
          nconf.set(this._environment + ':database:connection:db', null);
          nconf.set(this._environment + ':database:connection:filename', key.filename.trim());
        });
      }
    })
    .then(function() {
      nconf.save(function (err) {
        if (err) {
          return reject(err);
        }
        return resolve('Configuration saved successfully');
      });
    })
    .catch(function(err) {
      return reject(err);
    });
  });
}

Configuration.prototype.initTables = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var prompt = inquirer.createPromptModule();

    var initQuestions = [
      {
        type: 'input',
        name: 'prefix',
        message: 'Tables prefix',
        default: nconf.get(self._environment + ':tables:prefix')
      },
      {
        type: 'input',
        name: 'user',
        message: 'User table name',
        default: nconf.get(self._environment + ':tables:entities:user:table')
      },
      {
        type: 'input',
        name: 'client',
        message: 'Client table name',
        default: nconf.get(self._environment + ':tables:entities:client:table')
      },
      {
        type: 'input',
        name: 'token',
        message: 'Token table name',
        default: nconf.get(self._environment + ':tables:entities:token:table')
      },
      {
        type: 'input',
        name: 'code',
        message: 'Code table name',
        default: nconf.get(self._environment + ':tables:entities:code:table')
      },
      {
        type: 'input',
        name: 'role',
        message: 'Role table name',
        default: nconf.get(self._environment + ':tables:entities:role:table')
      },
      {
        type: 'input',
        name: 'userRole',
        message: 'UserRole table name',
        default: nconf.get(self._environment + ':tables:entities:userRole:table')
      },
      {
        type: 'input',
        name: 'resource',
        message: 'Resource table name',
        default: nconf.get(self._environment + ':tables:entities:resource:table')
      },
      {
        type: 'input',
        name: 'permission',
        message: 'Permission table name',
        default: nconf.get(self._environment + ':tables:entities:permission:table')
      },
      {
        type: 'input',
        name: 'policy',
        message: 'Policy table name',
        default: nconf.get(self._environment + ':tables:entities:policy:table')
      }
    ];

    prompt(initQuestions)
    .then(function(key, value) {
      nconf.set(self._environment + ':tables:prefix', key.prefix.trim());
      nconf.set(self._environment + ':tables:entities:user:table', key.user.trim());
      nconf.set(self._environment + ':tables:entities:client:table', key.client.trim());
      nconf.set(self._environment + ':tables:entities:token:table', key.token.trim());
      nconf.set(self._environment + ':tables:entities:code:table', key.code.trim());
      nconf.set(self._environment + ':tables:entities:role:table', key.role.trim());
      nconf.set(self._environment + ':tables:entities:userRole:table', key.userRole.trim());
      nconf.set(self._environment + ':tables:entities:resource:table', key.resource.trim());
      nconf.set(self._environment + ':tables:entities:permission:table', key.permission.trim());
      nconf.set(self._environment + ':tables:entities:policy:table', key.policy.trim());
    })
    .then(function() {
      nconf.save(function (err) {
        if (err) {
          return reject(err);
        }
        return resolve('Tables configuration saved successfully');
      });
    })
    .catch(function(err) {
      return reject(err);
    });
  });
}

Configuration.prototype.resetConfig = function(key) {
  return new Promise(function(resolve, reject) {
    nconf.reset(function() {
      nconf.set('current', 'development');
      nconf.set('development:applications', null);
      nconf.set('development:userPasswordEnc', 'bcrypt');
      nconf.set('development:crypto:key', 'o!rDE(Qbrq7u4OV');
      nconf.set('development:crypto:inputEncoding', 'utf8');
      nconf.set('development:crypto:outputEncoding', 'base64');
      nconf.set('development:database', null);
      nconf.set('development:tables:prefix', '');
      nconf.set('development:tables:entities:user:table', 'users');
      nconf.set('development:tables:entities:client:table', 'clients');
      nconf.set('development:tables:entities:token:table', 'tokens');
      nconf.set('development:tables:entities:code:table', 'codes');
      nconf.set('development:tables:entities:role:table', 'roles');
      nconf.set('development:tables:entities:userRole:table', 'usersRoles');
      nconf.set('development:tables:entities:resource:table', 'resources');
      nconf.set('development:tables:entities:permission:table', 'permissions');
      nconf.set('development:tables:entities:policy:table', 'policies');
      nconf.set('production:applications', null);
      nconf.set('production:userPasswordEnc', 'bcrypt');
      nconf.set('production:crypto:key', 'o!rDE(Qbrq7u4OV');
      nconf.set('production:crypto:inputEncoding', 'utf8');
      nconf.set('production:crypto:outputEncoding', 'base64');
      nconf.set('production:database', null);
      nconf.set('production:tables:prefix', '');
      nconf.set('production:tables:entities:user:table', 'users');
      nconf.set('production:tables:entities:client:table', 'clients');
      nconf.set('production:tables:entities:token:table', 'tokens');
      nconf.set('production:tables:entities:code:table', 'codes');
      nconf.set('production:tables:entities:role:table', 'roles');
      nconf.set('production:tables:entities:userRole:table', 'usersRoles');
      nconf.set('production:tables:entities:resource:table', 'resources');
      nconf.set('production:tables:entities:permission:table', 'permissions');
      nconf.set('production:tables:entities:policy:table', 'policies');
      nconf.save(function (err) {
        if (err) {
          return reject(err);
        }
        return resolve('Configuration cleared successfully');
      });
    });
  });
}

Configuration.prototype.getConfig = function(key) {
  var val = null;
  if (!key) {
    val = nconf.get(this._environment);
  }
  else {
    val = nconf.get(key);
  }
  return val;
}

Configuration.prototype.checkConfig = function() {
  var db = nconf.get(this._environment + ':database');
  if (!db) {
    return false;
  }
  return true;
}

exports = module.exports = new Configuration;
