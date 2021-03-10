const fs = require('fs')
const path = require('path')

const stylus = require('stylus')
const express = require('express')
const userHome = require('user-home')
const serveFavicon = require('serve-favicon')
const browserifyMiddleware = require('browserify-middleware')

const contacts = require('../routes/contacts')
const dataExport = require('../routes/export')
const projectDirectory = path.join(__dirname, '..')
const publicDirectory = path.join(projectDirectory, 'public')
const scriptsDirectory = path.join(publicDirectory, 'scripts')
const stylesDirectory = path.join(publicDirectory, 'styles')


function setupRoutes (app, isDevMode) {
  app.use(stylus.middleware({
    src: stylesDirectory,
    compile: (stylusString, filePath) => stylus(stylusString)
      .set('filename', filePath)
      .set('compress', !isDevMode)
      .set('sourcemap', isDevMode)
      .define('providers', fs
        .readdirSync(path.join(publicDirectory, 'images/providers'))
        .filter(fileName => fileName
            .toLowerCase()
            .endsWith('.png')
        )
        .map(fileName => fileName.replace(/\.png$/gi, ''))
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
  app.locals.basePath = userHome
  app.locals.baseURL = ''

  app.use(serveFavicon(path.join(publicDirectory, 'images/favicon.ico')))
  app.locals.styles = [{
    path: '/styles/dark.css',
    id: 'themeLink',
  }]
  app.use(stylus.middleware({
    src: path.join(projectDirectory, '../../styles/themes'),
    dest: path.join(publicDirectory, 'styles'),
    debug: isDevMode,
    compress: !isDevMode,
  }))

  setupRoutes(app, isDevMode)

  app.get('/files/Contacts/:fileName', (request, response) => {
    response.sendFile(
      path.join(app.locals.basePath, 'Contacts', request.params.fileName)
    )
  })

  app.set('view engine', 'pug')
}

module.exports = (options = {}) => {
  const {app, runsStandalone, locals, isDevMode, listeningCallback} = options

  if (runsStandalone) {
    setupStandalone(app, isDevMode, listeningCallback)
  }
  else {
    app.locals = locals
    setupRoutes(app, isDevMode)
  }
}
