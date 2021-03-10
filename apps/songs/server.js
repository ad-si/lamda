const path = require('path')

const express = require('express')
const stylus = require('stylus')
const errorHandler = require('errorhandler')

const songs = require('./routes/songs')
const routes = require('./routes')
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

  app.use('/raw', express.static(path.join(app.locals.basePath, 'routes')))

  app.set('views', path.join(projectDirectory, 'views'))

  app.get('/api/artists', routes.artists)
  app.get('/api/artists/:artistId', routes.artist)
  app.get('/api/artists/:artistId/songs', routes.songs)
  app.get('/api/artists/:artistId/songs/:songId', routes.song)

  app.get('/api/songs', routes.songs)

  app.get('*', songs)
}


if (runsStandalone) {
  const morgan = require('morgan')
  app.use(morgan('dev', {skip: () => !isDevMode}))

  const userHome = require('user-home')
  app.locals.basePath = userHome
  app.locals.baseURL = ''

  const serveFavicon = require('serve-favicon')
  const faviconPath = path.join(publicDirectory, 'images/favicon.ico')
  app.use(serveFavicon(faviconPath))

  app.locals.styles = [{
    path: '/styles/dark.css',
    id: 'themeLink',
  }]
  app.use(stylus.middleware({
    src: path.join(projectDirectory, '../themes'),
    dest: stylesDirectory,
    debug: isDevMode,
    compress: !isDevMode,
  }))

  setupRouting()

  if (isDevMode) {
    app.use(errorHandler())
  }

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
