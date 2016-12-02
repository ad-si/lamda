const path = require('path')

const express = require('express')
const stylus = require('stylus')

const index = require('./routes/index')
const app = express()
const isDevMode = app.get('env') === 'development'
const runsStandalone = !module.parent
const projectDirectory = __dirname
const publicDirectory = path.join(projectDirectory, 'public')
const stylesDirectory = path.join(publicDirectory, 'styles')


function setupRouting () {
  app.use(stylus.middleware({
    src: stylesDirectory,
    debug: isDevMode,
    compress: !isDevMode,
  }))
  app.use(express.static(publicDirectory))
  // TODO: Download news and serve from local file-system
  // app.use(express.static(path.join(app.locals.basePath, 'news')))
  app.set('views', path.join(projectDirectory, 'views'))
  app.get('/', index)
}


if (runsStandalone) {
  const morgan = require('morgan')
  app.use(morgan('dev', {skip: () => !isDevMode}))

  const serveFavicon = require('serve-favicon')
  const faviconPath = path.join(publicDirectory, 'images/favicon.ico')
  app.use(serveFavicon(faviconPath))

  const userHome = require('user-home')
  app.locals.basePath = userHome
  app.locals.baseURL = ''
  app.locals.styles = [{
    path: '/styles/dark.css',
    id: 'themeLink',
  }]

  app.use(stylus.middleware({
    src: path.join(projectDirectory, 'linked_modules/lamda-styles/themes'),
    dest: stylesDirectory,
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
