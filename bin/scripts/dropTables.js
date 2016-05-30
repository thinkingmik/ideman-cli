var Configuration = require('../configuration');

var dropsIdemanTables = function() {
  return new Promise(function(resolve, reject) {
    var config = Configuration.getConfig();
    var tables = Configuration.getTableConfig();
    var prefix = Configuration.getTablePrefix();
    var knex = require('knex')(config.database);

    return knex.raw('')
    .then(function() {
      return knex.schema.hasTable(prefix + tables.policy.table)
      .then(function(exists) {
        if (exists) {
          console.log('[DROP] Dropping ' + tables.policy.table + ' table');
          return knex.schema.dropTable(prefix + tables.policy.table);
        }
      });
    })
    .then(function() {
      return knex.schema.hasTable(prefix + tables.permission.table)
      .then(function(exists) {
        if (exists) {
          console.log('[DROP] Dropping ' + tables.permission.table + ' table');
          return knex.schema.dropTableIfExists(prefix + tables.permission.table);
        }
      });
    })
    .then(function() {
      return knex.schema.hasTable(prefix + tables.resource.table)
      .then(function(exists) {
        if (exists) {
          console.log('[DROP] Dropping ' + tables.resource.table + ' table');
          return knex.schema.dropTableIfExists(prefix + tables.resource.table);
        }
      });
    })
    .then(function() {
      return knex.schema.hasTable(prefix + tables.code.table)
      .then(function(exists) {
        if (exists) {
          console.log('[DROP] Dropping ' + tables.code.table + ' table');
          return knex.schema.dropTableIfExists(prefix + tables.code.table);
        }
      });
    })
    .then(function() {
      return knex.schema.hasTable(prefix + tables.token.table)
      .then(function(exists) {
        if (exists) {
          console.log('[DROP] Dropping ' + tables.token.table + ' table');
          return knex.schema.dropTableIfExists(prefix + tables.token.table);
        }
      });
    })
    .then(function() {
      return knex.schema.hasTable(prefix + tables.client.table)
      .then(function(exists) {
        if (exists) {
          console.log('[DROP] Dropping ' + tables.client.table + ' table');
          return knex.schema.dropTableIfExists(prefix + tables.client.table);
        }
      });
    })
    .then(function() {
      return knex.schema.hasTable(prefix + tables.userRole.table)
      .then(function(exists) {
        if (exists) {
          console.log('[DROP] Dropping ' + tables.userRole.table + ' table');
          return knex.schema.dropTableIfExists(prefix + tables.userRole.table);
        }
      });
    })
    .then(function() {
      return knex.schema.hasTable(prefix + tables.role.table)
      .then(function(exists) {
        if (exists) {
          console.log('[DROP] Dropping ' + tables.role.table + ' table');
          return knex.schema.dropTableIfExists(prefix + tables.role.table);
        }
      });
    })
    .then(function() {
      return knex.schema.hasTable(prefix + tables.user.table)
      .then(function(exists) {
        if (exists) {
          console.log('[DROP] Dropping ' + tables.user.table + ' table');
          return knex.schema.dropTableIfExists(prefix + tables.user.table);
        }
      });
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
