var Configuration = require('../configuration')('./config.json');
var prefix = 'idm_';

var dropsIdemanTables = function() {
  return new Promise(function(resolve, reject) {
    var config = Configuration.getConfig();
    var knex = require('knex')(config.database);

    return knex.raw('')
      .then(function() {
        console.log('[DROP] Dropping policies table');
        return knex.schema.dropTableIfExists(prefix + 'policies');
      })
      .then(function() {
        console.log('[DROP] Dropping permissions table');
        return knex.schema.dropTableIfExists(prefix + 'permissions');
      })
      .then(function() {
        console.log('[DROP] Dropping resources table');
        return knex.schema.dropTableIfExists(prefix + 'resources');
      })
      .then(function() {
        console.log('[DROP] Dropping codes table');
        return knex.schema.dropTableIfExists(prefix + 'codes');
      })
      .then(function() {
        console.log('[DROP] Dropping tokens table');
        return knex.schema.dropTableIfExists(prefix + 'tokens');
      })
      .then(function() {
        console.log('[DROP] Dropping clients table');
        return knex.schema.dropTableIfExists(prefix + 'clients');
      })
      .then(function() {
        console.log('[DROP] Dropping usersRoles table');
        return knex.schema.dropTableIfExists(prefix + 'usersRoles');
      })
      .then(function() {
        console.log('[DROP] Dropping roles table');
        return knex.schema.dropTableIfExists(prefix + 'roles');
      })
      .then(function() {
        console.log('[DROP] Dropping users table');
        return knex.schema.dropTableIfExists(prefix + 'users');
      })
      .then(function() {
        return resolve(true);
      })
      .catch(function(err) {
        return reject(err);
      });
  });
}

exports.idemanTables = dropsIdemanTables;
