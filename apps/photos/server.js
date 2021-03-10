const path = require('path')

const express = require('express')
const stylus = require('stylus')
const imageResizer = require('image-resizer-middleware')

const index = require('./routes/index')
const events = require('./routes/events')
const photo = require('./routes/photo')

const app = express()
const isDevMode = app.get('env') === 'development'
const runsStandalone = !module.parent
const projectDirectory = __dirname
const publicDirectory = path.join(projectDirectory, 'public')


function setupRouting () {
  app.use(stylus.middleware({
    src: path.join(publicDirectory, 'styles'),
    debug: isDevMode,
    compress: !isDevMode,
  }))
  app.use(express.static(publicDirectory))

  const photosDirectory = path.join(app.locals.basePath, 'photos')
  app.use(imageResizer.getMiddleware({
    basePath: photosDirectory,
    thumbnailsPath: path.join(publicDirectory, 'thumbnails'),
  }))
  // TODO: Use dedicated subpath for image-loading
  app.use(express.static(path.join(app.locals.basePath, 'photos')))
  app.set('views', path.join(projectDirectory, 'views'))

  app.get('/', index)
  app.get('/:year', events.period)
  app.get('/:year/:month', events.period)
  app.get('/:year/:month/:day', events.period)
  app.get('/:year/:month/:day/:event', events.event)
  app.get('/:year/:month/:day/:event/:photo', photo)
}


if (runsStandalone) {
  const serveFavicon = require('serve-favicon')
  app.use(serveFavicon(path.join(publicDirectory, 'images/favicon.ico')))

  const userHome = require('user-home')
  app.locals.basePath = userHome
  app.locals.baseURL = ''
  app.locals.styles = [{
    path: '/styles/dark.css',
    id: 'themeLink',
  }]
  app.use(stylus.middleware({
    src: path.join(projectDirectory, 'styles/themes'),
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
