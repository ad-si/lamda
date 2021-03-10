const path = require('path')

const errorHandler = require('errorhandler')
const express = require('express')
const morgan = require('morgan')
const serveFavicon = require('serve-favicon')
const stylus = require('stylus')
const userHome = require('user-home')
// TODO: Reenable
// const lilyware = require('lilyware')

const pieces = require('./routes/pieces')
const piece = require('./routes/piece')
const raw = require('./routes/raw')
const playlist = require('./routes/playlist')
const playlists = require('./routes/playlists')

const app = express()
const runsStandalone = !module.parent
const isDevMode = app.get('env') === 'development'

app.locals.baseURL = '/sheetmusic'

const projectPath = __dirname
const modulesPath = path.join(projectPath, 'node_modules')
const publicPath = path.join(projectPath, 'public')
const stylesPath = path.join(publicPath, 'styles')
const thumbsPath = global.projectURL
  ? path.join(global.projectURL, 'thumbs', 'sheetmusic')
  : path.join(publicPath, 'thumbs')
const basePath = process.env.LAMDA_SHEETMUSIC_CONTENTPATH ||
  path.join(userHome, 'Dropbox/Sheetmusic/')


function setupRouting () {
  app.use(stylus.middleware({
    src: stylesPath,
    debug: isDevMode,
    compress: !isDevMode,
  }))
  app.use(express.static(publicPath))
  app.use('/node_modules', express.static(modulesPath))

  // TODO: Reenable
  // app.use(lilyware(songsPath))

  app.use(express.static(app.locals.songsPath))

  app.set('views', path.join(projectPath, 'views'))

  app.get('/', pieces(app.locals.songsPath, thumbsPath))

  app.get('/playlists', playlists(app.locals.playlistsPath))
  app.get('/playlist/:id', playlist(app.locals.playlistsPath, app.locals.baseURL))

  app.get('/:name', piece(app.locals.songsPath, thumbsPath, app.locals.baseURL))
  app.get('/:name/raw', raw(app.locals.songsPath, thumbsPath, app.locals.baseURL))
}


if (runsStandalone) {
  app.use(morgan('dev', {skip: () => !isDevMode}))

  Object.assign(app.locals, {
    basePath,
    baseURL: '',
    runsStandalone,
    styles: [{
      path: '/styles/dark.css',
      id: 'themeLink',
    }],
  })

  app.locals.songsPath = path.join(app.locals.basePath, 'songs')
  app.locals.playlistsPath = path.join(app.locals.basePath, 'playlists')

  // const fontsPath = path.join(projectPath, 'styles/font/fonts')
  // app.use('/fonts', express.static(fontsPath))

  const faviconPath = path.join(projectPath, 'public/images/favicon.ico')
  app.use(serveFavicon(faviconPath))

  app.use(stylus.middleware({
    src: path.join(modulesPath, 'lamda-styles/themes'),
    dest: stylesPath,
    debug: isDevMode,
    compress: !isDevMode,
  }))

  setupRouting()

  if (isDevMode) app.use(errorHandler())

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




