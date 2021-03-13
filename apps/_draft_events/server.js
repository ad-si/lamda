import url from 'url'
import path from 'path'

import express from 'express'
import stylus from 'stylus'
import userHome from 'user-home'
import serveFavicon from 'serve-favicon'
import browserifyMiddleware from 'browserify-middleware'

import events from './routes/events.js'


const app = express()
const isDevMode = app.get('env') === 'development'
const runsStandalone = true  // TODO: !module.parent
const dirname = path.dirname(url.fileURLToPath(import.meta.url))
const projectDirectory = dirname
const publicDirectory = path.join(projectDirectory, 'public')
const scriptsDirectory = path.join(publicDirectory, 'scripts')


function setupRouting () {
  app.use(stylus.middleware({
    src: path.join(publicDirectory, 'styles'),
    compress: !isDevMode,
  }))

  app.use('/scripts', browserifyMiddleware(scriptsDirectory))

  app.use(express.static(publicDirectory))

  app.set('views', path.join(projectDirectory, 'views'))

  app.get('/', events)
}


if (runsStandalone) {
  Object.assign(app.locals, {
    basePath: userHome,
    baseURL: '',
    runsStandalone: runsStandalone,
  })

  app.use(serveFavicon(path.join(publicDirectory, 'images/favicon.ico')))

  app.locals.styles = [{
    path: '/styles/dark.css',
    id: 'themeLink',
  }]
  app.use(stylus.middleware({
    src: path.join(projectDirectory, '../styles/themes'),
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

export default function (locals) {
  app.locals = locals
  setupRouting()
  return app
}

export const isCallback = true
