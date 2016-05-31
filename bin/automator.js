var inquirer = require('inquirer');
var Promise = require('bluebird');
var Configuration = require('./configuration');

function Automator(config) {
  this._config = config;
  this._knex = null;
  if (!this._config && !this._config.database) {
    this._knex = require('knex')(this._config.database);
  }
}

Automator.prototype.insertUser = function() {
  console.log(this._config);
}

exports = module.exports = Automator;
