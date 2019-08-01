const path = require('path')

const express = require('express')
const stylus = require('stylus')
const userHome = require('user-home')
const serveFavicon = require('serve-favicon')
const browserifyMiddleware = require('browserify-middleware')

const events = require('./routes/events')

const app = express()
const isDevMode = app.get('env') === 'development'
const runsStandalone = !module.parent
const projectDirectory = __dirname
const publicDirectory = path.join(projectDirectory, 'public')
const scriptsDirectory = path.join(publicDirectory, 'scripts')


function setupRouting () {
  app.use(stylus.middleware({
    src: path.join(publicDirectory, 'styles'),
    compress: !isDevMode,
  }))

  app.use('/scripts', browserifyMiddleware(scriptsDirectory))

  app.use(express.static(publicDirectory))

  app.set('views', path.join(projectDirectory, 'views'))

  app.get('/', events)
}


if (runsStandalone) {
  Object.assign(app.locals, {
    basePath: userHome,
    baseURL: '',
    runsStandalone: runsStandalone,
  })

  app.use(serveFavicon(path.join(publicDirectory, 'images/favicon.ico')))

  app.locals.styles = [{
    path: '/styles/dark.css',
    id: 'themeLink',
  }]
  app.use(stylus.middleware({
    src: path.join(projectDirectory, 'linked_modules/lamda-styles/themes'),
    dest: path.join(publicDirectory, 'styles'),
    debug: isDevMode,
    compress: !isDevMode,
  }))

  setupRouting()

  const port = 3000
  app.set('view engine', 'pug')
  app.listen(port)
  console.info(`App listens on http://localhost:${port}`)
}
else {
  module.exports = (locals) => {
    app.locals = locals
    setupRouting()
    return app
  }

  module.exports.isCallback = true
}