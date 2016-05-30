var Configuration = require('../configuration');

var cratesUserTable = function() {
  return new Promise(function(resolve, reject) {
    var config = Configuration.getConfig();
    var tables = Configuration.getTableConfig();
    var prefix = Configuration.getTablePrefix();
    var knex = require('knex')(config.database);

    return knex.raw('')
    .then(function() {
      return knex.schema.hasTable(prefix + tables.user.table)
      .then(function(exists) {
        if (!exists) {
          console.log('[CREATE] Creating ' + tables.user.table + ' table');
          return knex.schema.createTable(prefix + tables.user.table, function(table) {
            table.increments('id').primary();
            table.string('username', 50).notNullable().unique();
            table.string('password', 255).notNullable().unique();
            table.string('email', 100).notNullable().unique();
            table.string('firstName', 100).nullable();
            table.string('lastName', 100).nullable();
            table.boolean('enabled').defaultTo(true);
            table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
            table.timestamp('updatedAt').nullable();
          });
        }
        else {
          console.log('[CREATE] ' + tables.user.table + ' table already exists');
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

var cratesIdemanTables = function() {
  return new Promise(function(resolve, reject) {
    var config = Configuration.getConfig();
    var tables = Configuration.getTableConfig();
    var prefix = Configuration.getTablePrefix();
    var knex = require('knex')(config.database);

    return knex.raw('')
    .then(function() {
      return knex.schema.hasTable(prefix + tables.client.table)
      .then(function(exists) {
        if (!exists) {
          console.log('[CREATE] Creating ' + tables.client.table + ' table');
          return knex.schema.createTableIfNotExists(prefix + tables.client.table, function(table) {
            table.increments('id').primary();
            table.string('name', 50).notNullable().unique();
            table.string('secret', 255).notNullable().unique();
            table.string('description', 255).nullable();
            table.string('domain', 255).nullable();
            table.boolean('enabled').defaultTo(true);
            table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
            table.timestamp('updatedAt').nullable();
          });
        }
        else {
          console.log('[CREATE] ' + tables.client.table + ' table already exists');
        }
      });
    })
    .then(function() {
      return knex.schema.hasTable(prefix + tables.token.table)
      .then(function(exists) {
        if (!exists) {
          console.log('[CREATE] Creating ' + tables.token.table + ' table');
          return knex.schema.createTableIfNotExists(prefix + tables.token.table, function(table) {
            table.increments('id').primary();
            table.string('token', 767).notNullable().unique();
            table.string('refresh', 767).notNullable().unique();
            table.string('userAgent', 512).nullable();
            table.string('ipAddress', 39).nullable();
            table.bigInteger('userId').unsigned().index().references('id').inTable(prefix + tables.user.table).onDelete('CASCADE').onUpdate('CASCADE');
            table.bigInteger('clientId').unsigned().index().references('id').inTable(prefix + tables.client.table).onDelete('CASCADE').onUpdate('CASCADE');
            table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
          });
        }
        else {
          console.log('[CREATE] ' + tables.token.table + ' table already exists');
        }
      });
    })
    .then(function() {
      return knex.schema.hasTable(prefix + tables.code.table)
      .then(function(exists) {
        if (!exists) {
          console.log('[CREATE] Creating ' + tables.code.table + ' table');
          return knex.schema.createTableIfNotExists(prefix + tables.code.table, function(table) {
            table.increments('id').primary();
            table.string('code', 512).notNullable().unique();
            table.string('redirectUri', 255).nullable();
            table.bigInteger('userId').unsigned().index().references('id').inTable(prefix + tables.user.table).onDelete('CASCADE').onUpdate('CASCADE');
            table.bigInteger('clientId').unsigned().index().references('id').inTable(prefix + tables.client.table).onDelete('CASCADE').onUpdate('CASCADE');
            table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
          });
        }
        else {
          console.log('[CREATE] ' + tables.code.table + ' table already exists');
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

var cratesIdemanAclTables = function() {
  return new Promise(function(resolve, reject) {
    var config = Configuration.getConfig();
    var tables = Configuration.getTableConfig();
    var prefix = Configuration.getTablePrefix();
    var knex = require('knex')(config.database);

    return knex.raw('')
    .then(function() {
      return knex.schema.hasTable(prefix + tables.role.table)
      .then(function(exists) {
        if (!exists) {
          console.log('[CREATE] Creating ' + tables.role.table + ' table');
          return knex.schema.createTableIfNotExists(prefix + tables.role.table, function(table) {
            table.increments('id').primary();
            table.string('name', 50).notNullable().unique();
            table.string('description', 255).nullable();
            table.boolean('enabled').defaultTo(true);
            table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
            table.timestamp('updatedAt').nullable();
          });
        }
        else {
          console.log('[CREATE] ' + tables.role.table + ' table already exists');
        }
      });
    })
    .then(function() {
      return knex.schema.hasTable(prefix + tables.userRole.table)
      .then(function(exists) {
        if (!exists) {
          console.log('[CREATE] Creating usersRoles table');
          return knex.schema.createTableIfNotExists(prefix + tables.userRole.table, function(table) {
            table.increments('id').primary();
            table.bigInteger('userId').unsigned().index().references('id').inTable(prefix + tables.user.table).onDelete('NO ACTION').onUpdate('CASCADE');
            table.bigInteger('roleId').unsigned().index().references('id').inTable(prefix + tables.role.table).onDelete('NO ACTION').onUpdate('CASCADE');
            table.unique(['userId', 'roleId']);
            table.boolean('main').defaultTo(false);
            table.timestamp('activation').nullable();
            table.timestamp('expiration').nullable();
            table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
            table.timestamp('updatedAt').nullable();
          });
        }
        else {
          console.log('[CREATE] UsersRoles table already exists');
        }
      });
    })
    .then(function() {
      return knex.schema.hasTable(prefix + tables.resource.table)
      .then(function(exists) {
        if (!exists) {
          console.log('[CREATE] Creating ' + tables.resource.table + ' table');
          return knex.schema.createTableIfNotExists(prefix + tables.resource.table, function(table) {
            table.string('id', 50).primary();
            table.string('description', 255).nullable();
            table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
            table.timestamp('updatedAt').notNullable().nullable();
          });
        }
        else {
          console.log('[CREATE] ' + tables.resource.table + ' table already exists');
        }
      });
    })
    .then(function() {
      return knex.schema.hasTable(prefix + tables.permission.table)
      .then(function(exists) {
        if (!exists) {
          console.log('[CREATE] Creating ' + tables.permission.table + ' table');
          return knex.schema.createTableIfNotExists(prefix + tables.permission.table, function(table) {
            table.string('id', 50).primary();
            table.string('description', 255).nullable();
            table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
            table.timestamp('updatedAt').notNullable().nullable();
          });
        }
        else {
          console.log('[CREATE] ' + tables.permission.table + ' table already exists');
        }
      });
    })
    .then(function() {
      return knex.schema.hasTable(prefix + tables.policy.table)
      .then(function(exists) {
        if (!exists) {
          console.log('[CREATE] Creating ' + tables.policy.table + ' table');
          return knex.schema.createTableIfNotExists(prefix + tables.policy.table, function(table) {
            table.increments('id').primary();
            table.bigInteger('userId').nullable().unsigned().index().references('id').inTable(prefix + tables.user.table).onDelete('NO ACTION').onUpdate('CASCADE');
            table.bigInteger('roleId').nullable().unsigned().index().references('id').inTable(prefix + tables.role.table).onDelete('NO ACTION').onUpdate('CASCADE');
            table.string('resourceId').notNullable().index().references('id').inTable(prefix + tables.resource.table).onDelete('CASCADE').onUpdate('CASCADE');
            table.string('permissionId').notNullable().index().references('id').inTable(prefix + tables.permission.table).onDelete('CASCADE').onUpdate('CASCADE');
            table.unique(['userId', 'roleId', 'resourceId', 'permissionId']);
            table.timestamp('activation').nullable();
            table.timestamp('expiration').nullable();
            table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
            table.timestamp('updatedAt').nullable();
          });
        }
        else {
          console.log('[CREATE] ' + tables.policy.table + ' table already exists');
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

exports.userTable = cratesUserTable;
exports.idemanTables = cratesIdemanTables;
exports.idemanAclTables = cratesIdemanAclTables;
