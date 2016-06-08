Identity Manager Command Line Interface Tool
================
Tool for creation of database schemas and others boring jobs usefull for [`ideman`](https://github.com/thinkingmik/ideman) and [`ideman-acl`](https://github.com/thinkingmik/ideman-acl) node modules.
It supports `postgres`, `mysql`, `mariasql` and `sqlite3`.

# Summary
* [Installation](#install)
* [Usage](#usage)
* [Credits](#credits)
* [License](#license)

# <a name="install"></a>Installation
In your project root run from command line:
```
$ npm install -g ideman-cli
```

# <a name="usage"></a>Usage
[`ideman-cli`] provides a set of interactive commands that can be used from command line:
```
$ ideman-cli <command> [arguments]
```

The availables commands are:
* [config](#config)
* [tables](#tables)
* [reset](#reset)
* [list](#list)
* [env](#env)
* [switch](#switch)
* [init](#init)
* [insert](#insert)
* [delete](#delete)
* [import](#import)
* [cypher](#cypher)
* [decypher](#decypher)
* [crypt](#crypt)

## <a name="config"></a>config
Initializes a configuration for database connection.

__Example__

```
$ ideman-cli config
```
---------------------------------------

## <a name="tables"></a>tables.
Initializes tables names.

__Example__

```
$ ideman-cli tables
```
---------------------------------------

## <a name="reset"></a>reset
Resets all configurations to default.

__Example__

```
$ ideman-cli reset
```
---------------------------------------

## <a name="list"></a>list [env]
Shows a JSON object with current configurations.


__Example__

```
$ ideman-cli list [development|production]
```
---------------------------------------

## <a name="env"></a>env
Shows the current environment.


__Example__

```
$ ideman-cli env
```
---------------------------------------

## <a name="switch"></a>switch
Switches environment.


__Example__

```
$ ideman-cli switch
```
---------------------------------------

## <a name="init"></a>init [application] [force]
Initializes database schemas for specified application. If `force` was specified, tables will be dropped.
If `application` was not specified, it takes the application value set into configuration.


__Example__

```
$ ideman-cli init [ideman|ideman-acl] [force]
```
---------------------------------------

## <a name="insert"></a>insert [entity]
Inserts a new entity into database.


__Example__

```
$ ideman-cli insert [user|client|token|code|role|userRole|permission|resource|policy]
```
---------------------------------------

## <a name="delete"></a>delete [entity]
Removes an existing entity from database.


__Example__

```
$ ideman-cli delete [user|client|token|code|role|userRole|permission|resource|policy]
```
---------------------------------------
## <a name="import"></a>import [filename]
Import entities from a JSON file.
File to import must be in this format:
```javascript
{
  "data": [
    {
      "entity": "user",
      "columns": {
        "username": "admin",
        "password": "$2a$05$Sbvj/0fQB/H/GaQZJg88iOP/ppZXTEtwCEF1Iff0hCt1t/PcJIfDa",
        "email": "admin@node.com",
        "firstName": "super",
        "lastName": "administrator"
      },
      "returning": "id"
    },
    {
      "entity": "client",
      "columns": {
        "name": "dashboard",
        "secret": "a1l4PsbkgQHgZzaN1lFQSw==",
        "description": "the dashboard client application",
        "domain": "localhost"
      },
      "returning": "id"
    }
  ]
}
```

__Example__

```
$ ideman-cli import [path]
```
---------------------------------------

## <a name="cypher"></a>cypher
Cyphers a text.


__Example__

```
$ ideman-cli cypher
```
---------------------------------------

## <a name="decypher"></a>decypher
Decyphers a text.


__Example__

```
$ ideman-cli decypher
```
---------------------------------------

## <a name="crypt"></a>crypt
Crypts a text.


__Example__

```
$ ideman-cli crypt
```

# <a name="credits"></a>Credits
- [knex](https://github.com/tgriesser/knex) by Tim Griesser

# <a name="license"></a>License
The [MIT License](https://github.com/thinkingmik/ideman-cli/blob/master/LICENSE)

Copyright (c) 2016 Michele Andreoli <http://thinkingmik.com>
