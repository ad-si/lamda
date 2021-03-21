import url from 'url'
import path from 'path'

import debug from 'debug'
import express from 'express'
import morgan from 'morgan'
import serveFavicon from 'serve-favicon'
import stylus from 'stylus'
import userHome from 'user-home'

import {one, all, cover} from './routes/books.js'
import pdfCoverMiddleware from './pdf-cover-middleware.js'


const log = debug('lamda:apps:books')


export function getApp (config = {}) {
  const {
    runsStandalone = true,
    locals = {lamda: {}},
  } = config

  const app = express()
  app.locals = locals

  const isDevMode = app.get('env') === 'development'
  const dirname = path.dirname(url.fileURLToPath(import.meta.url))

  const projectDirectory = dirname
  const viewsDirectory = path.join(projectDirectory, 'views')
  const modulesPath = path.join(projectDirectory, 'node_modules')
  const publicDirectory = path.join(projectDirectory, 'public')
  const stylesDirectory = path.join(publicDirectory, 'styles')
  const defaultFilesPath = path.join(userHome, 'Books')

  if (runsStandalone) {
    app.use(morgan('dev', {skip: () => !isDevMode}))

    app.locals.lamda.filePaths = [defaultFilesPath]
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
  }

  app.use(stylus.middleware({
    src: stylesDirectory,
    debug: isDevMode,
    compress: !isDevMode,
  }))

  const booksDirectory = app.locals.lamda.filePaths[0]

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

  log('App was successfully created')

  if (runsStandalone) {
    const port = 3000
    app.set('view engine', 'pug')
    app.listen(port, () => {
      console.info(`App listens on http://localhost:${port}`)
    })
  }
  else {
    return app
  }
}


export default function (locals) {
  return getApp({ runsStandalone: false, locals })
}


export const isCallback = true
