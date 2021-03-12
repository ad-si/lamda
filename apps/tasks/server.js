import url from 'url'
import path from 'path'
import childProcess from 'child_process'

import express from 'express'
import bodyParser from 'body-parser'
import stylus from 'stylus'
import errorHandler from 'errorhandler'
import browserifyMiddleware from 'browserify-middleware'
import fsp from 'fs-promise'
import yaml from 'js-yaml'
import moment from '@datatypes/moment'
const {Instant} = moment
import morgan from 'morgan'
import serveFavicon from 'serve-favicon'

import config from './config.js'
import tasks from './routes/tasks.js'


const app = express()
const isDevMode = app.get('env') === 'development'
const runsStandalone = true  // TODO: !module.parent

// Define important directories
const dirname = path.dirname(url.fileURLToPath(import.meta.url))
const projectDirectory = dirname
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
  app
    .route('/')
    .get(tasks)
    .post(
      bodyParser.json(),
      (request, response, next) => {
        const nowISO = new Instant()
          .toISOString()
        const nowSecond = nowISO
          .slice(0, 19)
          .replace(/:/g, '')
        const filePath = path.join(
          // directories[0] is always the main directory
          // TODO: Prompt the user where to store the task
          request.app.locals.directories[0],
          `${nowSecond}.yaml`,
        )
        const nowMinute = nowISO
          .slice(0, 16)
          .replace('T', ' ')
        const newTask = {
          [nowMinute]: {
            title: request.body.title,
          },
        }
        console.info(`Create task "${filePath}"`)

        fsp
          .writeFile(filePath, yaml.safeDump(newTask))
          .then(() => {
            response.sendStatus(200)
          })
          .catch(next)
      },
    )
  app.get('/:taskView', tasks)
}


if (runsStandalone) {
  app.use(morgan('dev', {skip: () => !isDevMode}))

  app.locals.baseURL = ''
  app.locals.directories = config.directories
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
      },
    )
  })

  if (isDevMode) app.use(errorHandler())

  app.set('view engine', 'pug')

  app.listen(config.port, () => {
    console.info(`App listens on http://localhost:${config.port}`)
  })
}


export default function (locals) {
  app.locals = locals
  setupRouting()
  return app
}

export const isCallback = true
