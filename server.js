const express = require('express')
const app = express()
const setupRouting = require('./modules/setupRouting')
const isDevMode = app.get('env') === 'development'
const runsStandalone = !module.parent
const consoleModule = require('console')
const logger = new consoleModule.Console(process.stdin, process.stdout)

if (runsStandalone) {
  setupRouting({app, runsStandalone, isDevMode})
  const port = 3000
  app.listen(
    port,
    () => logger.info('App listens on http://localhost:' + port)
  )
}
else {
  module.exports = (locals) => {
    setupRouting({
      app,
      locals,
      runsStandalone,
      isDevMode,
    })
    return app
  }
  module.exports.isCallback = true
}
