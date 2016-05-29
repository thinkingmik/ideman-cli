if (process.env.NODE_ENV == '' || !process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}
var Promise = require('bluebird');
var config = require('../configs/config')[process.env.NODE_ENV];
var knex = require('knex')(config.knex);
var prefix = 'idm_';

knex.raw('')
.then(function() {
  console.log('[DROP] Dropping table');
  return knex.schema.dropTableIfExists(prefix + 'codes');
})
.then(function() {
  console.log('[DROP] Dropping tokens table');
  return knex.schema.dropTableIfExists(prefix + 'tokens');
})
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
  process.exit(0);
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});
