#! /usr/bin/env node

const yargs = require('yargs')
// const options = yargs
yargs
  .commandDir('./commands')
  .help()
  .argv
