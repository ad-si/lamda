var express = require('express'),
    errorHandler = require('errorhandler'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    compress = require('compression'),
    logger = require('morgan'),
    nib = require('nib'),
    stylus = require('stylus'),
    path = require('path'),
    yaml = require('js-yaml'),
    fs = require('fs'),
    util = require('./util'),
    app = express(),

    api = require('./routes/api'),
    index = require('./routes/index'),
    settings = require('./routes/settings'),
    profile = require('./routes/profile'),
    appNames = fs.readdirSync('./apps'),
    apps = {},
    scripts = [
	    '/components/jquery/jquery.js',
	    '/components/mousetrap/mousetrap.js',
	    '/js/index.js'
    ],
    styles = [
	    '/styles/screen.css'
    ],
    title = 'Lamda OS',
    name,
    projectPath = __dirname


global.baseURL = process.env.LAMDA_HOME || __dirname
global.projectURL = projectPath
global.devMode = app.get('env') === 'development'
global.config = yaml.safeLoad(
	fs.readFileSync(path.join(global.baseURL, 'config.yaml'), 'utf-8')
)

appNames = appNames.filter(function (name) {

	var appPath = './apps/' + name

	return fs.lstatSync(appPath).isDirectory() && name !== 'boilerplate'
})


appNames.forEach(function (appName) {

	var appPath = './apps/' + appName,
	    appModule = require(appPath),
	    packageContent


	if (fs.existsSync(appPath + '/package.yaml')) {
		packageContent = yaml.safeLoad(
			fs.readFileSync(path.join(appPath, 'package.yaml'), 'utf-8')
		)
	}
	else if (fs.existsSync(path.join(appPath, 'package.json'))) {
		packageContent = JSON.parse(
			fs.readFileSync(path.join(appPath, 'package.json'), 'utf-8')
		)
	}
	else
		throw new Error('Package file is missing!')


	apps[appName] = packageContent

	if (!apps[appName].hasOwnProperty('lamda'))
		apps[appName].lamda = {}


	apps[appName].lamda.module = appModule
	apps[appName].lamda.path = appPath

	appModule.locals = {
		title: title,
		scripts: scripts,
		styles: styles,
		appNames: appNames,
		config: config,
		page: appName
	}

	app.use('/' + appName, appModule)
})


app.locals.title = title
app.locals.scripts = scripts
app.locals.styles = styles
app.locals.appNames = appNames
app.locals.config = config


// all environments
app.set('port', process.env.PORT || 2000)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(favicon(path.normalize('public/img/favicon.png')))
app.use(logger('dev'))
app.use(compress())
app.use(bodyParser())
app.use(methodOverride())


app.set('baseURL', process.env.baseURL || __dirname + '/home')


// Native Apps
app.get('/', index)
app.get('/settings', settings)
app.get('/' + global.config.owner.username, profile)


// TODO: API
/*
 app.get('/api/events', api.events)

 app.get(/\/api\/files(\/?.*)/, api.files)

 //app.get('/api/music/songs', api.music.songs)
 //app.get('/api/music/artists', api.music.artists)
 //app.get('/api/music/:artist', api.music.artist)
 //app.get('/api/music/:artist/:song', api.music.song)
 */


for (name in apps) {
	if (apps.hasOwnProperty(name)) {

		app.use(path.join('/assets', name, 'public'), stylus.middleware({
			src: path.join(__dirname, apps[name].lamda.path, 'public'),
			compile: function (string, path) {
				return util.compileStyl(string, path, global.config.theme)
			}
		}))

		app.use(
			path.join('/assets', name, 'public'),
			express.static(path.join(apps[name].lamda.path, 'public'))
		)
	}
}

app.use(stylus.middleware({
	src: 'public',
	compile: function (string, path) {
		return util.compileStyl(string, path, global.config.theme)
	}
}))

app.use(express.static('public'))
app.use('/thumbs', express.static('thumbs'))


if (global.devMode)
	app.use(errorHandler())

app.use(function (req, res) {

	res.status(404)

	if (req.accepts('html'))
		res.render('404.jade', {page: 'error404', url: req.url})

	else if (req.accepts('json'))
		res.send({ error: 'Not found' })

	else
		res.type('txt').send('Not found')
})

app.listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'))
})
