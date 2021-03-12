import url from 'url'
import path from 'path'

import express from 'express'
import stylus from 'stylus'
import serveFavicon from 'serve-favicon'

import index from './routes/index.js'
import faviconServer from './routes/faviconServer.js'
const app = express()
const isDevMode = app.get('env') === 'development'
const isMounted = false  // TODO: Boolean(module.parent)
const dirname = path.dirname(url.fileURLToPath(import.meta.url))


if (!isMounted) {
  app.locals.baseURL = ''
  const faviconPath = path.join(dirname, 'public/images/favicon.ico')

  app.use(serveFavicon(faviconPath))
  app.locals.styles = [{
    path: '/styles/dark.css',
    id: 'themeLink',
  }]
  app.use(stylus.middleware({
    src: path.join(dirname, '../styles/themes'),
    dest: path.join(dirname, 'public/styles'),
    debug: isDevMode,
    compress: !isDevMode,
  }))
}

app.use(stylus.middleware({
  src: path.join(dirname, 'public/styles'),
  debug: isDevMode,
  compress: !isDevMode,
}))
app.use(express.static(path.join(dirname, 'public')))
app.use(faviconServer())

app.set('views', path.join(dirname, '/views'))

app.get('/', index)

export default app

if (!isMounted) {
  const port = 3000
  app.set('view engine', 'pug')
  app.listen(port)
  console.info(`App listens on http://localhost:${port}`)
}
