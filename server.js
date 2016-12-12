const fs = require('fs')
const path = require('path')

const osenv = require('osenv')
const express = require('express')
const errorHandler = require('errorhandler')
const favicon = require('serve-favicon')
const compress = require('compression')
const logger = require('morgan')
const stylus = require('stylus')
const yaml = require('js-yaml')

const app = express()

const index = require('./routes/index')
const settings = require('./routes/settings')
const profile = require('./routes/profile')
const appLoader = require('./modules/appLoader')
const scripts = [
  '/components/jquery/jquery.js',
  '/components/mousetrap/mousetrap.js',
  '/js/index.js',
]
const styles = [
  {
    path: '/styles/dark.css',
    id: 'themeLink',
  },
]
const title = 'Lamda OS'


const homeDirectory = process.env.LAMDA_HOME || osenv.home()
const configsPath = path.join(homeDirectory, '.lamda')
const configFilePath = path.join(configsPath, 'config.yaml')
const projectPath = __dirname
const devMode = app.get('env') === 'development'
let configFileContent
let configObject = {}
const config = {
  owner: {},
}

try {
  configFileContent = fs.readFileSync(configFilePath)
  configObject = yaml.safeLoad(configFileContent)
}
catch (error) {
  if (!error.message.includes('no such file or directory')) {
    throw error
  }
  console.error('No config file was loaded')
}

Object.assign(config, configObject)


// All environments
app.set('port', process.env.PORT || 2000)

app.set('views', path.join(__dirname, 'linked_modules/lamda-views'))
app.set('view engine', 'pug')

app.use(favicon(path.normalize('public/img/favicon.png')))
app.use(logger('dev'))
app.use(compress())

app.use(stylus.middleware({
  src: path.join(__dirname, 'linked_modules/lamda-styles/themes'),
  dest: path.join(__dirname, 'public/styles'),
  debug: devMode,
  compress: !devMode,
}))

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(
  __dirname,
  'linked_modules/lamda-styles/linked_modules/open-iconic/font'
)))


const locals = {
  isMounted: true,
  runsStandalone: false,
  title,
  scripts,
  styles,
  config,
  homeDirectory,
  basePath: homeDirectory, // TODO: Deprecated
  projectPath,
}
app.locals = Object.assign({}, locals)
appLoader(app, locals)

// Native Apps
app.get('/', index)
app.get('/settings', settings)

if (config.owner.username) {
  app.get(`/${config.owner.username}`, profile)
}


// TODO: API
/*
 app.get('/api/events', api.events)

 app.get(/\/api\/files(\/?.*)/, api.files)

 //app.get('/api/music/songs', api.music.songs)
 //app.get('/api/music/artists', api.music.artists)
 //app.get('/api/music/:artist', api.music.artist)
 //app.get('/api/music/:artist/:song', api.music.song)
 */


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
    'Express server listening on http://localhost:' + app.get('port')
  )
})
