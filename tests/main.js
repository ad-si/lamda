
const express = require('express')
const app = express()
const setupRouting = require('../modules/setupRouting')
const consoleModule = require('console')
const logger = new consoleModule.Console(process.stdin, process.stdout)
const isDevMode = true
const runsStandalone = true
const port = 3756

setupRouting({app, runsStandalone, isDevMode})

const server = app.listen(port, () => {
  logger.info('App listens on http://localhost:' + port)
  server.close()
})
