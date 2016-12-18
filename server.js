const path = require('path')
const childProcess = require('child_process')

const express = require('express')
const stylus = require('stylus')
const errorHandler = require('errorhandler')
const browserifyMiddleware = require('browserify-middleware')
const config = require('./config')

const tasks = require('./routes/tasks')
const app = express()
const isDevMode = app.get('env') === 'development'
const runsStandalone = !module.parent

// Define important directories
const projectDirectory = __dirname
const viewsDirectory = path.join(projectDirectory, 'views')
const publicDirectory = path.join(projectDirectory, 'public')
const stylesDirectory = path.join(publicDirectory, 'styles')
const scriptsDirectory = path.join(publicDirectory, 'scripts')


function setupRouting () {
  app.use(stylus.middleware({
    src: stylesDirectory,
    debug: isDevMode,
    compress: !isDevMode,
  }))
  app.use('/scripts', browserifyMiddleware(scriptsDirectory))
  app.use(express.static(publicDirectory))
  app.set('views', viewsDirectory)
  app.get('/', tasks)
  app.get('/:taskView', tasks)
}


if (runsStandalone) {
  const morgan = require('morgan')
  app.use(morgan('dev', {skip: () => !isDevMode}))

  app.locals.baseURL = ''
  app.locals.directories = config.directories

  const serveFavicon = require('serve-favicon')
  app.use(serveFavicon(config.faviconPath))

  setupRouting()

  app.get('/files/*', (request, response) => {
    response.sendFile(path.join('/', request.params[0]))
  })

  app.use('/open', (request, response) => {
    const shellCommand = `edit "${path.normalize(decodeURI(request.path))}"`

    childProcess.exec(
      shellCommand,
      (error, stdout, stderr) => {
        if (stderr) console.error(stderr)
        if (stdout) console.info(stdout)
        if (error) throw error
        response.sendStatus(200)
      }
    )
  })

  if (isDevMode) app.use(errorHandler())

  app.set('view engine', 'pug')

  app.listen(config.port, () => {
    console.info(`App listens on http://localhost:${config.port}`)
  })
}
else {
  module.exports = (locals) => {
    app.locals = locals
    setupRouting()
    return app
  }

  module.exports.isCallback = true
}
