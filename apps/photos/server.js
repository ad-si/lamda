import url from 'url'
import path from 'path'

import express from 'express'
import stylus from 'stylus'
import imageResizer from 'image-resizer-middleware'

import serveFavicon from 'serve-favicon'
import userHome from 'user-home'

import index from './routes/index.js'
import events from './routes/events.js'
import photo from './routes/photo.js'


const app = express()
const isDevMode = app.get('env') === 'development'
const runsStandalone = true  // TODO: !module.parent
const dirname = path.dirname(url.fileURLToPath(import.meta.url))
const publicDirectory = path.join(dirname, 'public')
const modulesPath = path.join(dirname, 'node_modules')
const publicPath = path.join(dirname, 'public')
const stylesPath = path.join(publicPath, 'styles')


function setupRouting () {
  app.use(stylus.middleware({
    src: path.join(publicDirectory, 'styles'),
    debug: isDevMode,
    compress: !isDevMode,
  }))
  app.use(express.static(publicDirectory))

  const photosDirectory = path.join(app.locals.basePath, 'Dropbox/Photos')
  app.use(imageResizer.getMiddleware({
    basePath: photosDirectory,
    thumbnailsPath: path.join(publicDirectory, 'thumbnails'),
  }))
  // TODO: Use dedicated subpath for image-loading
  app.use(express.static(photosDirectory))
  app.set('views', path.join(dirname, 'views'))

  app.get('/', index)
  app.get('/:year', events.period)
  app.get('/:year/:month', events.period)
  app.get('/:year/:month/:day', events.period)
  app.get('/:year/:month/:day/:event', events.event)
  app.get('/:year/:month/:day/:event/:photo', photo)
}


if (runsStandalone) {
  app.use(serveFavicon(path.join(publicDirectory, 'images/favicon.ico')))

  app.locals.basePath = userHome
  app.locals.baseURL = ''
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
