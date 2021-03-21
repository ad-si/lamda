import url from 'url'
import path from 'path'

import express from 'express'
import stylus from 'stylus'
import errorHandler from 'errorhandler'
import morgan from 'morgan'
import userHome from 'user-home'
import serveFavicon from 'serve-favicon'

import songs from './routes/songs.js'
import routes from './routes/index.js'


const app = express()
const isDevMode = app.get('env') === 'development'
const runsStandalone = true  // TODO: !module.parent
const dirname = path.dirname(url.fileURLToPath(import.meta.url))
const publicDirectory = path.join(dirname, 'public')
const stylesPath = path.join(publicDirectory, 'styles')
const modulesPath = path.join(dirname, 'node_modules')


function setupRouting () {
  app.use(stylus.middleware({
    src: stylesPath,
    debug: isDevMode,
    compress: !isDevMode,
  }))
  app.use(express.static(publicDirectory))

  app.use('/raw', express.static(path.join(app.locals.basePath, 'routes')))

  app.set('views', path.join(dirname, 'views'))

  app.get('/api/artists', routes.artists)
  app.get('/api/artists/:artistId', routes.artist)
  app.get('/api/artists/:artistId/songs', routes.songs)
  app.get('/api/artists/:artistId/songs/:songId', routes.song)

  app.get('/api/songs', routes.songs)

  app.get('*', songs)
}


if (runsStandalone) {
  app.use(morgan('dev', {skip: () => !isDevMode}))

  app.locals.basePath = userHome
  app.locals.baseURL = ''

  const faviconPath = path.join(publicDirectory, 'images/favicon.ico')
  app.use(serveFavicon(faviconPath))

  app.locals.styles = [{
    path: '/styles/dark.css',
    id: 'themeLink',
  }]

  app.use(stylus.middleware({
    src: path.join(modulesPath, '@lamdahq/styles/themes'),
    dest: stylesPath,
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


export default function (locals) {
  app.locals = locals
  setupRouting()
  return app
}

export const isCallback = true
