if (process.env.NODE_ENV == '' || !process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}
var Promise = require('bluebird');
var config = require('../configs/config')[process.env.NODE_ENV];
var knex = require('knex')(config.knex);
var prefix = 'idm_';

knex.raw('')
.then(function() {
  console.log('[DROP] Dropping table codes');
  return knex.schema.dropTableIfExists(prefix + 'codes');
})
.then(function() {
  console.log('[DROP] Dropping table tokens');
  return knex.schema.dropTableIfExists(prefix + 'tokens');
})
.then(function() {
  console.log('[DROP] Dropping table policies');
  return knex.schema.dropTableIfExists(prefix + 'policies');
})
.then(function() {
  console.log('[DROP] Dropping table permissions');
  return knex.schema.dropTableIfExists(prefix + 'permissions');
})
.then(function() {
  console.log('[DROP] Dropping table resources');
  return knex.schema.dropTableIfExists(prefix + 'resources');
})
.then(function() {
  console.log('[DROP] Dropping table clients');
  return knex.schema.dropTableIfExists(prefix + 'clients');
})
.then(function() {
  console.log('[DROP] Dropping table usersRoles');
  return knex.schema.dropTableIfExists(prefix + 'usersRoles');
})
.then(function() {
  console.log('[DROP] Dropping table roles');
  return knex.schema.dropTableIfExists(prefix + 'roles');
})
.then(function() {
  console.log('[DROP] Dropping table users');
  return knex.schema.dropTableIfExists(prefix + 'users');
})
.then(function() {
  process.exit(0);
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});
