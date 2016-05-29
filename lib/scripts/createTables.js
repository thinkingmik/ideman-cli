var Configuration = require('../configuration')('./config.json');
var prefix = 'idm_';

var cratesUserTable = function() {
  return new Promise(function(resolve, reject) {
    var config = Configuration.getConfig();
    var knex = require('knex')(config.database);

    return knex.raw('')
      .then(function() {
        console.log('[CREATE] Creating users table');
        return knex.schema.createTable(prefix + 'users', function(table) {
          table.increments('id').primary();
          table.string('username', 50).notNullable().unique();
          table.string('password', 255).notNullable().unique();
          table.string('email', 100).notNullable().unique();
          table.string('firstName', 100).nullable();
          table.string('lastName', 100).nullable();
          table.boolean('enabled').defaultTo(true);
          table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
          table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
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
    var knex = require('knex')(config.database);

    return knex.raw('')
      .then(function() {
        console.log('[CREATE] Creating clients table');
        return knex.schema.createTable(prefix + 'clients', function(table) {
          table.increments('id').primary();
          table.string('name', 50).notNullable().unique();
          table.string('secret', 255).notNullable().unique();
          table.string('description', 255).nullable();
          table.string('domain', 255).nullable();
          table.boolean('enabled').defaultTo(true);
          table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
          table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
        });
      })
      .then(function() {
        console.log('[CREATE] Creating tokens table');
        return knex.schema.createTable(prefix + 'tokens', function(table) {
          table.increments('id').primary();
          table.string('token', 1024).notNullable().unique();
          table.string('refresh', 1024).notNullable().unique();
          table.string('userAgent', 512).nullable();
          table.string('ipAddress', 39).nullable();
          table.bigInteger('userId').unsigned().index().references('id').inTable(prefix + 'users').onDelete('CASCADE').onUpdate('CASCADE');
          table.bigInteger('clientId').unsigned().index().references('id').inTable(prefix + 'clients').onDelete('CASCADE').onUpdate('CASCADE');
          table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
        });
      })
      .then(function() {
        console.log('[CREATE] Creating codes table');
        return knex.schema.createTable(prefix + 'codes', function(table) {
          table.increments('id').primary();
          table.string('code', 512).notNullable().unique();
          table.string('redirectUri', 255).nullable();
          table.bigInteger('userId').unsigned().index().references('id').inTable(prefix + 'users').onDelete('CASCADE').onUpdate('CASCADE');
          table.bigInteger('clientId').unsigned().index().references('id').inTable(prefix + 'clients').onDelete('CASCADE').onUpdate('CASCADE');
          table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
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
    var knex = require('knex')(config.database);

    return knex.raw('')
      .then(function() {
        console.log('[CREATE] Creating roles table');
        return knex.schema.createTable(prefix + 'roles', function(table) {
          table.increments('id').primary();
          table.string('name', 50).notNullable().unique();
          table.string('description', 255).nullable();
          table.boolean('enabled').defaultTo(true);
          table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
          table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
        });
      })
      .then(function() {
        console.log('[CREATE] Creating usersRoles table');
        return knex.schema.createTable(prefix + 'usersRoles', function(table) {
          table.increments('id').primary();
          table.bigInteger('userId').unsigned().index().references('id').inTable(prefix + 'users').onDelete('NO ACTION').onUpdate('CASCADE');
          table.bigInteger('roleId').unsigned().index().references('id').inTable(prefix + 'roles').onDelete('NO ACTION').onUpdate('CASCADE');
          table.unique(['userId', 'roleId']);
          table.boolean('main').defaultTo(false);
          table.timestamp('activation').nullable();
          table.timestamp('expiration').nullable();
          table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
          table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
        });
      })
      .then(function() {
        console.log('[CREATE] Creating resources table');
        return knex.schema.createTable(prefix + 'resources', function(table) {
          table.string('id', 50).primary();
          table.string('description', 255).nullable();
          table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
          table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
        });
      })
      .then(function() {
        console.log('[CREATE] Creating permissions table');
        return knex.schema.createTable(prefix + 'permissions', function(table) {
          table.string('id', 50).primary();
          table.string('description', 255).nullable();
          table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
          table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
        });
      })
      .then(function() {
        console.log('[CREATE] Creating policies table');
        return knex.schema.createTable(prefix + 'policies', function(table) {
          table.increments('id').primary();
          table.bigInteger('userId').nullable().unsigned().index().references('id').inTable(prefix + 'users').onDelete('NO ACTION').onUpdate('CASCADE');
          table.bigInteger('roleId').nullable().unsigned().index().references('id').inTable(prefix + 'roles').onDelete('NO ACTION').onUpdate('CASCADE');
          table.string('resourceId').notNullable().index().references('id').inTable(prefix + 'resources').onDelete('CASCADE').onUpdate('CASCADE');
          table.string('permissionId').notNullable().index().references('id').inTable(prefix + 'permissions').onDelete('CASCADE').onUpdate('CASCADE');
          table.unique(['userId', 'roleId', 'resourceId', 'permissionId']);
          table.timestamp('activation').nullable();
          table.timestamp('expiration').nullable();
          table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
          table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
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
