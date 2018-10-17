const path = require('path')
const runTest = require('ava')
const loadEvents = require('../modules/loadEvents')

runTest.only('Processing of events', () => {
  return loadEvents(path.join(__dirname, 'events'))
})
