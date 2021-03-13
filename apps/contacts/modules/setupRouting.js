import fs from 'fs'
import url from 'url'
import path from 'path'

import stylus from 'stylus'
import express from 'express'
import userHome from 'user-home'
import serveFavicon from 'serve-favicon'
import browserifyMiddleware from 'browserify-middleware'

import contacts from '../routes/contacts.js'
import dataExport from '../routes/export.js'


const dirname = path.dirname(url.fileURLToPath(import.meta.url))
const projectDirectory = path.join(dirname, '..')
const modulesPath = path.join(projectDirectory, 'node_modules')
const publicDirectory = path.join(projectDirectory, 'public')
const scriptsDirectory = path.join(publicDirectory, 'scripts')
const stylesPath = path.join(publicDirectory, 'styles')


function setupRoutes (app, isDevMode) {
  app.use(stylus.middleware({
    src: stylesPath,
    compile: (stylusString, filePath) => stylus(stylusString)
      .set('filename', filePath)
      .set('compress', !isDevMode)
      .set('sourcemap', isDevMode)
      .define('providers', fs
        .readdirSync(path.join(publicDirectory, 'images/providers'))
        .filter(fileName => fileName
          .toLowerCase()
          .endsWith('.png'),
        )
        .map(fileName => fileName.replace(/\.png$/gi, '')),
      )
      .define('baseURL', app.locals.baseURL),
  }))

  app.use('/scripts', browserifyMiddleware(scriptsDirectory))

  app.use(express.static(publicDirectory))

  app.set('views', path.join(projectDirectory, 'views'))

  app.get('/', contacts)
  app.get('/export', dataExport)
}


function setupStandalone (app, isDevMode) {
  app.locals.basePath = path.join(userHome, 'Dropbox')
  app.locals.baseURL = ''

  app.use(serveFavicon(path.join(publicDirectory, 'images/favicon.ico')))
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

  setupRoutes(app, isDevMode)

  app.get('/files/Contacts/:fileName', (request, response) => {
    response.sendFile(
      path.join(app.locals.basePath, 'Contacts', request.params.fileName),
    )
  })

  app.set('view engine', 'pug')
}

export default function (options = {}) {
  const {app, runsStandalone, locals, isDevMode, listeningCallback} = options

  if (runsStandalone) {
    setupStandalone(app, isDevMode, listeningCallback)
  }
  else {
    app.locals = locals
    setupRoutes(app, isDevMode)
  }
}
