#! /usr/bin/env node

const yargs = require('yargs')

yargs
  .commandDir('../commands')
  .demandCommand(1)
  .help()
  .alias('help', 'h')
  .argv
