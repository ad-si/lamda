const path = require('path')

const express = require('express')
const stylus = require('stylus')

const books = require('./routes/books')
const pdfCoverMiddleware = require('./pdf-cover-middleware.js')

const app = express()
const isDevMode = app.get('env') === 'development'
const runsStandalone = !module.parent

const projectDirectory = __dirname
const viewsDirectory = path.join(projectDirectory, 'views')
const modulesPath = path.join(projectDirectory, 'node_modules')
const publicDirectory = path.join(projectDirectory, 'public')
const stylesDirectory = path.join(publicDirectory, 'styles')


function setupRouting (app) {
  app.use(stylus.middleware({
    src: stylesDirectory,
    debug: isDevMode,
    compress: !isDevMode,
  }))
  const booksDirectory = app.locals.basePath

  // Returns for a URL "document.pdf.jpg" the cover-image of "document.pdf".
  // Supports query parameters `width`, `height`, `max-width`, and `max-height`.
  app.use(pdfCoverMiddleware.getMiddleware({
    basePath: booksDirectory,
    thumbnailsPath: path.join(publicDirectory, 'thumbnails'),
  }))


  app.use(express.static(publicDirectory))
  app.use(express.static(booksDirectory))
  app.use('/node_modules', express.static(modulesPath))

  app.set('views', viewsDirectory)

  app.get('/', books.all)
  app.get('/:book', books.one)
  app.get('/:book.epub/*', books.cover)
}


if (runsStandalone) {
  const morgan = require('morgan')
  app.use(morgan('dev', {skip: () => !isDevMode}))

  const userHome = require('user-home')
  app.locals.basePath = path.join(userHome, 'Dropbox/Books/')
  app.locals.baseURL = ''
  app.locals.styles = [{
    path: '/styles/dark.css',
    id: 'themeLink',
  }]

  const serveFavicon = require('serve-favicon')
  const faviconPath = path.join(publicDirectory, 'images/favicon.ico')
  app.use(serveFavicon(faviconPath))

  app.use(stylus.middleware({
    src: path.join(modulesPath, 'lamda-styles/themes'),
    dest: stylesDirectory,
    debug: isDevMode,
    compress: !isDevMode,
  }))

  setupRouting(app)

  const port = 3000
  app.set('view engine', 'pug')
  app.listen(port)
  console.info(`App listens on http://localhost:${port}`)
}
else {
  module.exports = (locals) => {
    app.locals = locals
    setupRouting(app)
    return app
  }

  module.exports.isCallback = true
}
