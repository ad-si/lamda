import url from 'url'
import path from 'path'

import express from 'express'
import stylus from 'stylus'
import morgan from 'morgan'
import userHome from 'user-home'
import serveFavicon from 'serve-favicon'

import {one, all, cover} from './routes/books.js'
import pdfCoverMiddleware from './pdf-cover-middleware.js'


const app = express()
const isDevMode = app.get('env') === 'development'
const runsStandalone = true  // TODO: !module.parent
const dirname = path.dirname(url.fileURLToPath(import.meta.url))

const projectDirectory = dirname
const viewsDirectory = path.join(projectDirectory, 'views')
const modulesPath = path.join(projectDirectory, 'node_modules')
const publicDirectory = path.join(projectDirectory, 'public')
const stylesDirectory = path.join(publicDirectory, 'styles')


function setupRouting () {
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

  app.get('/', all)
  app.get('/:book', one)
  app.get('/:book.epub/*', cover)
}


if (runsStandalone) {
  app.use(morgan('dev', {skip: () => !isDevMode}))

  app.locals.basePath = path.join(userHome, 'Dropbox/Books/')
  app.locals.baseURL = ''
  app.locals.styles = [{
    path: '/styles/dark.css',
    id: 'themeLink',
  }]

  const faviconPath = path.join(publicDirectory, 'images/favicon.ico')
  app.use(serveFavicon(faviconPath))

  app.use(stylus.middleware({
    src: path.join(modulesPath, '@lamdahq/styles/themes'),
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

export default function (locals) {
  app.locals = locals
  setupRouting(app)
  return app
}

export const isCallback = true
