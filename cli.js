#! /usr/bin/env node

const yargs = require('yargs')
// const options = yargs
yargs
  .commandDir('./commands')
  .demandCommand(1)
  .help()
  .alias('help', 'h')
  .argv
