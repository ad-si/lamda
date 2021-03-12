#! /usr/bin/env node

import yargs from 'yargs'

yargs
  .commandDir('./commands')
  .demandCommand(1)
  .help()
  .alias('help', 'h')
  .argv
