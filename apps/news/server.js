import url from 'url'
import path from 'path'

import express from 'express'
import stylus from 'stylus'
import morgan from 'morgan'
import serveFavicon from 'serve-favicon'
import userHome from 'user-home'

import index from './routes/index.js'


const app = express()
const isDevMode = app.get('env') === 'development'
const runsStandalone = true  // TODO: !module.parent
const dirname = path.dirname(url.fileURLToPath(import.meta.url))
const projectDirectory = dirname
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
  app.use(morgan('dev', {skip: () => !isDevMode}))

  const faviconPath = path.join(publicDirectory, 'images/favicon.ico')
  app.use(serveFavicon(faviconPath))

  app.locals.basePath = userHome
  app.locals.baseURL = ''
  app.locals.styles = [{
    path: '/styles/dark.css',
    id: 'themeLink',
  }]

  app.use(stylus.middleware({
    src: path.join(projectDirectory, '../styles/themes'),
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


export default  function (locals) {
  app.locals = locals
  setupRouting()
  return app
}

export const isCallback = true
