const express = require('express')
const app = express()
const setupRouting = require('./modules/setupRouting')
const isDevMode = app.get('env') === 'development'
const runsStandalone = !module.parent

if (runsStandalone) {
  setupRouting({app, runsStandalone, isDevMode})
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
