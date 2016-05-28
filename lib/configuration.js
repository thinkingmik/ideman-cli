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

Configuration.prototype.initDbConfig = function() {
  var env = this._environment;

  return new Promise(function(resolve, reject) {
    var prompt = inquirer.createPromptModule();

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

Configuration.prototype.deleteDbConfig = function(key) {
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

Configuration.prototype.getDbConfig = function(key) {
  var env = this._environment;

  return new Promise(function(resolve, reject) {
    var val = null;
    if (!key) {
      val = nconf.get(env + ':database');
    }
    else {
      val = resolve(nconf.get(key + ':database'));
    }
    if (!val) {
      return reject('No config found');
    }
    return resolve(val);
  });
}

Configuration.prototype.checkDbConfig = function() {
  var db = nconf.get(this._environment + ':database');
  if (!db) {
    return false;
  }
  return true;
}

exports = module.exports = function(path) {
  return new Configuration(path);
}
