import url from 'url'
import path from 'path'

import errorHandler from 'errorhandler'
import express from 'express'
import morgan from 'morgan'
import serveFavicon from 'serve-favicon'
import stylus from 'stylus'
import userHome from 'user-home'
// TODO: Reenable import lilyware from 'lilyware'

import pieces from './routes/pieces.js'
import piece from './routes/piece.js'
import raw from './routes/raw.js'
import playlist from './routes/playlist.js'
import playlists from './routes/playlists.js'

const app = express()
const runsStandalone = true  // TODO: Replace !module.parent
const isDevMode = app.get('env') === 'development'

app.locals.baseURL = '/sheetmusic'

const dirname = path.dirname(url.fileURLToPath(import.meta.url))
const projectPath = dirname
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
  app.get('/playlist/:id',
    playlist(app.locals.playlistsPath, app.locals.baseURL),
  )

  app.get('/:name',
    piece(app.locals.songsPath, thumbsPath, app.locals.baseURL),
  )
  app.get('/:name/raw',
    raw(app.locals.songsPath, thumbsPath, app.locals.baseURL),
  )
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
    src: path.join(modulesPath, '@lamdahq/styles/themes'),
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


export default function (locals) {
  app.locals = locals
  setupRouting()
  return app
}

export const isCallback = true




