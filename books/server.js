const path = require('path')

const express = require('express')

const setupRouting = require('./modules/setupRouting')

const app = express()
const isDevMode = app.get('env') === 'development'
const runsStandalone = !module.parent
const projectDirectory = __dirname
const publicDirectory = path.join(projectDirectory, 'public')


if (runsStandalone) {
  const morgan = require('morgan')
  app.use(morgan('dev', {skip: () => !isDevMode}))

  const userHome = require('user-home')
  app.locals.basePath = userHome
  app.locals.baseURL = ''
  app.locals.styles = [{
    path: '/styles/dark.css',
    id: 'themeLink',
  }]

  const serveFavicon = require('serve-favicon')
  const faviconPath = path.join(publicDirectory, 'images/favicon.ico')
  app.use(serveFavicon(faviconPath))

  setupRouting(app)

  const port = 3000
  app.set('view engine', 'pug')
  app.listen(port)
  console.info(`App listens on http://localhost:${port}`)
}
else {
  module.exports = (locals) => {
    app.locals = locals
    setupRouting(app)
    return app
  }

  module.exports.isCallback = true
}