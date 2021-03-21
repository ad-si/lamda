import fs from 'fs'
import url from 'url'
import path from 'path'

import stylus from 'stylus'
import express from 'express'
import userHome from 'user-home'
import serveFavicon from 'serve-favicon'
import browserifyMiddleware from 'browserify-middleware'

import contacts from './routes/contacts.js'
import dataExport from './routes/export.js'


export function getApp (config = {}) {
  const {
    runsStandalone = true,
    locals = { lamda: {} },
  } = config

  const app = express()
  app.locals = locals

  const isDevMode = app.get('env') === 'development'
  const dirname = path.dirname(url.fileURLToPath(import.meta.url))
  const modulesPath = path.join(dirname, 'node_modules')
  const publicDirectory = path.join(dirname, 'public')
  const scriptsDirectory = path.join(publicDirectory, 'scripts')
  const stylesPath = path.join(publicDirectory, 'styles')
  const defaultFilesPath = path.join(userHome, 'Contacts')

  if (runsStandalone) {
    app.locals.lamda.filePaths = [process.argv[2] || defaultFilesPath]
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
  }

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

  const contactsDirectory = app.locals.lamda.filePaths[0]

  app.use('/scripts', browserifyMiddleware(scriptsDirectory))

  app.use(express.static(publicDirectory))

  app.set('views', path.join(dirname, 'views'))

  app.get('/', contacts)
  app.get('/export', dataExport)

  app.get('/files/Contacts/:fileName', (request, response) => {
    response.sendFile(
      path.join(contactsDirectory, request.params.fileName),
    )
  })

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
