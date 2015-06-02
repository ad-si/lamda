#! /usr/bin/env node

var program = require('commander'),
    packageFile = require('../package.json')

program
	.version(packageFile.version)
	.option('-h, --home <path>', 'Set home folder')

program.parse(process.argv)

if (program.args.length === 0)
	program.help()
