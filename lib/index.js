#! /usr/bin/env node
var program = require('commander');

program.version('1.0.0')
  .usage('ideman-cli <option>')
  .option('-d, --drop [table]', 'Drop specified table/s')
  .parse(process.argv);

if (!program.args.length) {
    program.help();
}
else {
  var keywords = program.args;
  var stdin = process.stdin;
  var stdout = process.stdout;

  stdout.write('Welcome to IDEMAN COMMAND LINE tool!\n\n');
}
