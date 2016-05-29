var _ = require('underscore');
var fs = require('fs');
var nconf = require('nconf');
var inquirer = require('inquirer');
var Promise = require('bluebird');

function Configuration(path) {
  this._path = path;
  nconf.env().argv();
  nconf.file(this._path);
  this._environment = nconf.get('current') || 'development';
}

Configuration.prototype.getEnvironment = function() {
  return this._environment;
}

Configuration.prototype.switchEnvironment = function() {
  var env = this._environment;

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
        default: env
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
          return resolve('Switched config environment from ' + env + ' to ' + this._environment);
        });
      })
      .catch(function(err) {
        return reject(err);
      });
  });
}

Configuration.prototype.initConfig = function() {
  var env = this._environment;

  return new Promise(function(resolve, reject) {
    var prompt = inquirer.createPromptModule();

    var apps = nconf.get(env + ':applications');
    var idemanApp = _.contains(apps, 'ideman');
    var idemanAclApp = _.contains(apps, 'ideman-acl');

    var initQuestions = [
      {
        type: 'list',
        name: 'environment',
        message: 'Environment',
        choices: [
          'development',
          'production'
        ],
        default: env
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
        type: 'input',
        name: 'cryptoKey',
        message: 'Secret cypher key (watch your ideman settings or use default)',
        default: nconf.get(env + ':crypto:key') || 'o!rDE(Qbrq7u4OV'
      },
      {
        type: 'input',
        name: 'cryptoInputEnc',
        message: 'Input encoding for text cypher',
        default: nconf.get(env + ':crypto:inputEncoding') || 'utf8'
      },
      {
        type: 'input',
        name: 'cryptoOutputEnc',
        message: 'Output encoding for text cypher',
        default: nconf.get(env + ':crypto:outputEncoding') || 'base64'
      },
      {
        type: 'list',
        name: 'dbclient',
        message: 'DB client',
        choices: [
          'pg',
          'mysql'
        ],
        default: nconf.get(env + ':database:client')
      }
    ];

    prompt(initQuestions)
      .then(function(key, value) {
        this._environment = key.environment;
        nconf.set('current', this._environment);
        nconf.set(this._environment + ':applications', key.applications);
        nconf.set(this._environment + ':crypto:key', key.cryptoKey);
        nconf.set(this._environment + ':crypto:inputEncoding', key.cryptoInputEnc);
        nconf.set(this._environment + ':crypto:outputEncoding', key.cryptoOutputEnc);

        var connection = nconf.get(this._environment + ':database:connection');
        var pgQuestions = [
          {
            type: 'input',
            name: 'connstring',
            message: 'Connection string',
            default: (connection instanceof Object) ? null : connection
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

        if (key.dbclient === 'pg') {
          nconf.set(this._environment + ':database:client', key.dbclient);
          return prompt(pgQuestions)
            .then(function(key, value) {
              nconf.set(this._environment + ':database:connection', key.connstring);
            });
        }
        else {
          nconf.set(this._environment + ':database:client', key.dbclient);
          return prompt(mysqlQuestions)
            .then(function(key, value) {
              nconf.set(this._environment + ':database:connection:host', key.host);
              nconf.set(this._environment + ':database:connection:user', key.username);
              nconf.set(this._environment + ':database:connection:password', key.password);
              nconf.set(this._environment + ':database:connection:database', key.database);
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

Configuration.prototype.deleteConfig = function(key) {
  return new Promise(function(resolve, reject) {
    nconf.reset(function() {
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
  var db = nconf.get(this._environment);
  if (!db) {
    return false;
  }
  return true;
}

exports = module.exports = function(path) {
  return new Configuration(path);
}
