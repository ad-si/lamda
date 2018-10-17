const path = require('path')

const express = require('express')
const stylus = require('stylus')
const serveFavicon = require('serve-favicon')

const index = require('./routes/index')
const faviconServer = require('./routes/faviconServer')
const app = express()
const isDevMode = app.get('env') === 'development'
const isMounted = Boolean(module.parent)


if (!isMounted) {
  app.locals.baseURL = ''
  const faviconPath = path.join(__dirname, 'public/images/favicon.ico')

  app.use(serveFavicon(faviconPath))
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
app.use(faviconServer())

app.set('views', path.join(__dirname, '/views'))

app.get('/', index)

module.exports = app

if (!isMounted) {
  const port = 3000
  app.set('view engine', 'pug')
  app.listen(port)
  console.info(`App listens on http://localhost:${port}`)
}
