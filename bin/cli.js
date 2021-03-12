#! /usr/bin/env node

import yargs from 'yargs'
import start from './start.js'

yargs(process.argv.slice(2))
  .command(start)
  .demandCommand(1)
  .help()
  .alias('help', 'h')
  .argv
