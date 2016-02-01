'use strict'

let path = require('path')
let runTest = require('ava')
let moment = require('moment')

let dummyApi = require('./_dummyApi')
let processEvents = require('../modules/processEvents')
let loadEvents = require('../modules/loadEvents')
let events = []


runTest.only('Processing of events', (test) => {
	return loadEvents(path.join(__dirname, 'events'))
		.then(files => {
			processEvents(files)
		})
})
