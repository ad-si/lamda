import url from 'url'
import path from 'path'

import express from 'express'
import stylus from 'stylus'
import serveFavicon from 'serve-favicon'
import userHome from 'user-home'

import index from './routes/index.js'
import faviconServer from './routes/faviconServer.js'
const app = express()
const isDevMode = app.get('env') === 'development'
const runsStandalone = true  // TODO: !module.parent

const dirname = path.dirname(url.fileURLToPath(import.meta.url))
const viewsPath =  path.join(dirname, 'views')
const modulesPath = path.join(dirname, 'node_modules')
const publicPath = path.join(dirname, 'public')
const stylesPath = path.join(publicPath, 'styles')
const faviconPath = path.join(publicPath, 'images/favicon.ico')

let projectsDir = path.join(userHome, 'Dropbox/Projects')

global.config = {}


if (runsStandalone) {
  app.locals.baseURL = ''

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
}

app.use(stylus.middleware({
  src: stylesPath,
  debug: isDevMode,
  compress: !isDevMode,
}))
app.use(express.static(path.join(dirname, 'public')))
app.use(faviconServer({projectsDir}))

app.set('views', path.join(dirname, '/views'))

app.get('/', index({projectsDir}))


export default app

if (runsStandalone) {
  const port = 3000
  app.set('view engine', 'pug')
  app.listen(port)
  console.info(`App listens on http://localhost:${port}`)
}
