import url from 'url'
import path from 'path'

import express from 'express'
import stylus from 'stylus'
import imageResizer from 'image-resizer-middleware'
import serveFavicon from 'serve-favicon'
import errorHandler from 'errorhandler'
import morgan from 'morgan'
import userHome from 'user-home'

import things from './routes/things.js'
import thing from './routes/thing.js'


const app = express()
const runsStandalone = true  // TODO: !module.parent
const isDevMode = app.get('env') === 'development'

const dirname = path.dirname(url.fileURLToPath(import.meta.url))
const projectPath = dirname
const viewsPath =  path.join(projectPath, 'views')
const modulesPath = path.join(projectPath, 'node_modules')
const publicPath = path.join(projectPath, 'public')
const stylesPath = path.join(publicPath, 'styles')


function setupRouting () {
  app.use(stylus.middleware({
    src: stylesPath,
    debug: isDevMode,
    compress: !isDevMode,
  }))
  app.use(express.static(publicPath))

  app.use(imageResizer.getMiddleware({
    basePath: app.locals.basePath,
    thumbnailsPath: path.join(publicPath, 'thumbnails'),
  }))
  app.use(express.static(app.locals.basePath))
  app.use('/node_modules', express.static(modulesPath))

  app.set('views', viewsPath)

  app.get('/', things(app.locals))
  app.get('/:id', thing(app.locals))
}

if (runsStandalone) {
  app.use(morgan('dev', {skip: () => !isDevMode}))

  Object.assign(app.locals, {
    basePath: path.join(userHome, 'Dropbox/Things/'),
    baseURL: '',
    runsStandalone,
    styles: [{
      path: '/styles/dark.css',
      id: 'themeLink',
    }],
  })

  const faviconPath = path.join(publicPath, 'images/favicon.ico')
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
