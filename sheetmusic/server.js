const path = require('path')

const express = require('express')
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

global.basePath = global.basePath || userHome
app.locals.baseURL = '/sheetmusic'

const songsPath = path.join(global.basePath, 'sheetmusic', 'songs')
const playlistsPath = path.join(global.basePath, 'sheetmusic', 'playlists')
const thumbsPath = global.projectURL
  ? path.join(global.projectURL, 'thumbs', 'sheetmusic')
  : path.join(__dirname, 'public', 'thumbs')
const isDevMode = app.get('env') === 'development'
const isMounted = Boolean(module.parent)


if (!isMounted) {
  app.locals.baseURL = ''
  const fontsPath = path.join(__dirname,
    'linked_modules/lamda-styles/linked_modules/font/fonts')
  const faviconPath = path.join(__dirname, 'public/images/favicon.ico')

  app.use(serveFavicon(faviconPath))
  app.use('/fonts', express.static(fontsPath))
  app.locals.styles = [{
    path: '/styles/dark.css',
    id: 'themeLink',
  }]
  app.use(stylus.middleware({
    src: path.join(__dirname, 'linked_modules/lamda-styles/themes'),
    dest: path.join(__dirname, 'public/styles'),
    debug: isDevMode,
    compress: !isDevMode,
  }))
}

app.use(stylus.middleware({
  src: path.join(__dirname, 'public/styles'),
  debug: isDevMode,
  compress: !isDevMode,
}))
app.use(express.static(path.join(__dirname, 'public')))

// TODO: Reenable
// app.use(lilyware(songsPath))
app.use(express.static(songsPath))

app.set('views', path.join(__dirname, 'views'))

app.get('/', pieces(songsPath, thumbsPath))

app.get('/playlists', playlists(playlistsPath))
app.get('/playlist/:id', playlist(playlistsPath, app.locals.baseURL))

app.get('/:name', piece(songsPath, thumbsPath, app.locals.baseURL))
app.get('/:name/raw', raw(songsPath, thumbsPath, app.locals.baseURL))

module.exports = app

if (!isMounted) {
  const port = 3000
  app.set('view engine', 'pug')
  app.listen(port)
  console.info(`App listens on http://localhost:${port}`)
}
