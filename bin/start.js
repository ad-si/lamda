import path from 'path'
import { fileURLToPath } from 'url'

import compress from 'compression'
import Config from '@datatypes/config'
import errorHandler from 'errorhandler'
import express from 'express'
import favicon from 'serve-favicon'
import logger from 'morgan'
import stylus from 'stylus'
import userHome from 'user-home'

import index from '../source/api/index.js'
import settings from '../source/api/settings.js'
import profile from '../source/api/profile.js'
import appLoader from '../source/modules/appLoader.js'
import debug from 'debug'


const app = express()
const log = debug('lamda')
const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectPath = path.join(dirname, '..')
const homeDirectory = process.env.LAMDA_HOME || userHome
const stylesDirectory = path.join(projectPath, 'public/styles')
const viewsPath = path.join(projectPath, 'source/views')

const devMode = app.get('env') === 'development'

const publicDirectory = path.join(projectPath, 'public')
const defaults = {
  title: 'Lamda OS',
  port: 2000,
  faviconPath: path.join(publicDirectory, 'img/favicon.png'),
  scripts: [
    '/components/jquery/jquery.js',
    '/components/mousetrap/mousetrap.js',
    '/js/index.js',
  ],
  styles: [
    {
      path: '/styles/dark.css',
      id: 'themeLink',
    },
  ],
  owner: {},
}
const config = new Config({appName: 'lamda'})
  .loadEnvironment()
  .loadCliArguments()
  .loadDefaultFiles()
  .merge(defaults)
  .config
const appToPaths = {
  'events': [path.join(userHome, 'Dropbox/Events')],
  'files': [path.join(userHome, 'Dropbox/Files')],
  'movies': [path.join(userHome, 'Dropbox/Movies')],
  'news': [path.join(userHome, 'Dropbox/News')],
  'photos': [path.join(userHome, 'Dropbox/Photos')],
  'projects': [path.join(userHome, 'Dropbox/Projects')],
  'sheetmusic': [path.join(userHome, 'Dropbox/Sheetmusic')],
  'songs': [path.join(userHome, 'Dropbox/Songs')],
  'tasks': [path.join(userHome, 'Dropbox/Tasks')],
  'things': [path.join(userHome, 'Dropbox/Things')],
  'books': [path.join(userHome, 'Dropbox/Books')],
  'contacts': [path.join(userHome, 'Dropbox/Contacts')],
}


async function startServer () {
  // All environments
  app.set('port', config.port)

  app.set('views', viewsPath)
  app.set('view engine', 'pug')

  app.use(favicon(config.faviconPath))
  app.use(logger('dev'))
  app.use(compress())

  app.use(stylus.middleware({
    src: path.join(projectPath, 'source/styles/themes'),
    dest: stylesDirectory,
    debug: devMode,
    compress: !devMode,
  }))

  app.use(express.static(path.join(projectPath, 'public')))
  app.use(express.static(path.join(
    projectPath,
    'node_modules/open-iconic/font',
  )))


  const locals = {
    isMounted: true,
    runsStandalone: false,
    title: config.title,
    scripts: config.scripts,
    styles: config.styles,
    config,
    homeDirectory,
    projectPath,
  }

  app.locals = Object.assign({}, locals)

  await appLoader({app, locals, appToPaths})

  // TODO:
  // config.views.forEach(view => {
  //
  // })

  // Native Apps
  app.get('/', index)
  app.get('/settings', settings)

  if (config.owner && config.owner.username) {
    app.get(`/${config.owner.username}`, profile)
  }


  if (devMode) {
    app.use(errorHandler())
  }

  app.use((request, response) => {
    response.status(404)

    if (request.accepts('html')) {
      response.render('404.pug', {page: 'error404', url: request.url})
    }
    else if (request.accepts('json')) {
      response.send({error: 'Not found'})
    }
    else {
      response
        .type('txt')
        .send('Not found')
    }
  })

  app.listen(app.get('port'), () => {
    log(`Express server listening on http://localhost:${app.get('port')}`)
  })
}


export default {
  command: 'start',
  desc: 'Start Lamda server',
  handler: startServer,
}
