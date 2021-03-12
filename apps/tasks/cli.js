#! /usr/bin/env node

import yargs from 'yargs'
// const options = yargs

yargs(process.argv.slice(2))
  .commandDir('./commands')
  .demandCommand(1)
  .help()
  .alias('help', 'h')
  .argv
