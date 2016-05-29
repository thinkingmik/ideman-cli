if (process.env.NODE_ENV == '' || !process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}
var Promise = require('bluebird');
var config = require('../configs/config')[process.env.NODE_ENV];
var knex = require('knex')(config.knex);
var User = require('../models/userModel');
var Resource = require('../models/resourceModel');
var Permission = require('../models/permissionModel');
var Client = require('../models/clientModel');
var Role = require('../models/roleModel');
var UserRole = require('../models/userRoleModel');
var Policy = require('../models/policyModel');

var promise = new Promise(function(resolve, reject) {
  return resolve(true);
})
.then(function() {
  console.log('[SEED] Inserting new user admin');
  return User.forge({
    username: 'admin',
    password: 'admin123',
    email: 'admin@node.com',
    firstName: 'super',
    lastName: 'administrator'
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new user e.vedder');
  return User.forge({
    username: 'e.vedder',
    password: 'vedder123',
    email: 'e.vedder@node.com',
    firstName: 'Eddie',
    lastName: 'Vedder'
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new user m.mccready');
  return User.forge({
    username: 'm.mccready',
    password: 'mccready123',
    email: 'm.mccready@node.com',
    firstName: 'Mike',
    lastName: 'McCready'
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new user j.ament');
  return User.forge({
    username: 'j.ament',
    password: 'ament123',
    email: 'j.ament@node.com',
    firstName: 'Jeff',
    lastName: 'Ament'
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new user m.cameron');
  return User.forge({
    username: 'm.cameron',
    password: 'cameron123',
    email: 'm.cameron@node.com',
    firstName: 'Matt',
    lastName: 'Cameron'
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new user s.gossard');
  return User.forge({
    username: 's.gossard',
    password: 'gossard123',
    email: 's.gossard@node.com',
    firstName: 'Stone',
    lastName: 'Gossard'
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new client application dashboard');
  return Client.forge({
    name: 'dashboard',
    secret: 'dashboard123',
    description: 'the dashboard client application',
    domain: 'localhost'
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new role administrator');
  return Role.forge({
    name: 'administrator',
    description: 'the administrator role'
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new role member');
  return Role.forge({
    name: 'member',
    description: 'the member role'
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new user\'s role');
  return UserRole.forge({
    userId: 1,
    roleId: 1
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new user\'s role');
  return UserRole.forge({
    userId: 2,
    roleId: 2
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new user\'s role');
  return UserRole.forge({
    userId: 3,
    roleId: 2
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new user\'s role');
  return UserRole.forge({
    userId: 4,
    roleId: 2
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new user\'s role');
  return UserRole.forge({
    userId: 5,
    roleId: 2
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new user\'s role');
  return UserRole.forge({
    userId: 6,
    roleId: 2
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new permission get');
  return Permission.forge({
    id: 'get',
    description: 'the read permission'
  })
  .save(null, {method: 'insert'});
})
.then(function() {
  console.log('[SEED] Inserting new permission post');
  return Permission.forge({
    id: 'post',
    description: 'the creation permission'
  })
  .save(null, {method: 'insert'});
})
.then(function() {
  console.log('[SEED] Inserting new permission put');
  return Permission.forge({
    id: 'put',
    description: 'the update permission'
  })
  .save(null, {method: 'insert'});
})
.then(function() {
  console.log('[SEED] Inserting new permission delete');
  return Permission.forge({
    id: 'delete',
    description: 'the deletion permission'
  })
  .save(null, {method: 'insert'});
})
.then(function() {
  console.log('[SEED] Inserting new resource users');
  return Resource.forge({
    id: 'users',
    description: 'the users resource'
  })
  .save(null, {method: 'insert'});
})
.then(function() {
  console.log('[SEED] Inserting new resource clients');
  return Resource.forge({
    id: 'clients',
    description: 'the clients resource'
  })
  .save(null, {method: 'insert'});
})
.then(function() {
  console.log('[SEED] Inserting new resource roles');
  return Resource.forge({
    id: 'roles',
    description: 'the roles resource'
  })
  .save(null, {method: 'insert'});
})
.then(function() {
  console.log('[SEED] Inserting new policy');
  return Policy.forge({
    userId: 1,
    roleId: null,
    resourceId: 'users',
    permissionId: 'get'
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new policy');
  return Policy.forge({
    userId: null,
    roleId: 1,
    resourceId: 'users',
    permissionId: 'post'
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new policy');
  return Policy.forge({
    userId: 2,
    roleId: null,
    resourceId: 'clients',
    permissionId: 'get'
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new policy');
  return Policy.forge({
    userId: null,
    roleId: 2,
    resourceId: 'clients',
    permissionId: 'post'
  })
  .save();
})
.then(function() {
  process.exit(0);
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});
