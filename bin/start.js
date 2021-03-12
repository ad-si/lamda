import path from 'path'

import osenv from 'osenv'
import express from 'express'
import errorHandler from 'errorhandler'
import favicon from 'serve-favicon'
import compress from 'compression'
import logger from 'morgan'
import stylus from 'stylus'
import Config from '@datatypes/config'
import { fileURLToPath } from 'url'

const app = express()

import index from '../source/api/index.js'
import settings from '../source/api/settings.js'
import profile from '../source/api/profile.js'
import appLoader from '../source/modules/appLoader.js'


const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectPath = path.join(dirname, '..')
const homeDirectory = process.env.LAMDA_HOME || osenv.home()
const stylesDirectory = path.join(projectPath, 'public/styles')

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

function startServer () {
  // All environments
  app.set('port', config.port)

  app.set('views', path.join(projectPath, 'views'))
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
    basePath: homeDirectory, // TODO: Deprecated
    projectPath,
  }
  app.locals = Object.assign({}, locals)
  appLoader(app, locals)

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
    // eslint-disable-next-line no-console
    console.info(
      'Express server listening on http://localhost:' + app.get('port'),
    )
  })

}


export default {
  command: 'start',
  desc: 'Start Lamda server',
  handler: startServer,
}
