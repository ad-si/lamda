var fs = require('fs'),
	path = require('path'),

	osenv = require('osenv'),
	express = require('express'),
	errorHandler = require('errorhandler'),
	favicon = require('serve-favicon'),
	compress = require('compression'),
	logger = require('morgan'),
	stylus = require('stylus'),
	yaml = require('js-yaml'),

	utils = require('./utils'),
	app = express(),

	index = require('./routes/index'),
	settings = require('./routes/settings'),
	profile = require('./routes/profile'),
	appLoader = require('./modules/appLoader'),
	loadedApps,
	scripts = [
		'/components/jquery/jquery.js',
		'/components/mousetrap/mousetrap.js',
		'/js/index.js'
	],
	styles = [
		{
			path: '/styles/dark.css',
			id: 'themeLink'
		}
	],
	title = 'Lamda OS',
	name,
	locals


const basePath = process.env.LAMDA_HOME || osenv.home()
const projectPath = __dirname
const devMode = app.get('env') === 'development'
const config = {
	owner: {}
}

try {
	Object.assign(
		config,
		yaml.safeLoad(fs.readFileSync(
			path.join(basePath, 'config.yaml')
		))
	)
}
catch (error) {
	console.error(error.stack)
}

// All environments
app.set('port', process.env.PORT || 2000)

app.set('views', path.join(__dirname, 'linked_modules/lamda-views'))
app.set('view engine', 'jade')

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


locals = {
	title: title,
	scripts: scripts,
	styles: styles,
	config: config,
	isMounted: true,
	basePath,
	projectPath
}
app.locals = locals
loadedApps = appLoader(app, locals)

// Native Apps
app.get('/', index)
app.get('/settings', settings)

if (config.owner.username)
	app.get('/' + config.owner.username, profile)


// TODO: API
/*
 app.get('/api/events', api.events)

 app.get(/\/api\/files(\/?.*)/, api.files)

 //app.get('/api/music/songs', api.music.songs)
 //app.get('/api/music/artists', api.music.artists)
 //app.get('/api/music/:artist', api.music.artist)
 //app.get('/api/music/:artist/:song', api.music.song)
 */


if (devMode)
	app.use(errorHandler())

app.use(function (req, res) {

	res.status(404)

	if (req.accepts('html'))
		res.render('404.jade', {page: 'error404', url: req.url})

	else if (req.accepts('json'))
		res.send({error: 'Not found'})

	else
		res.type('txt').send('Not found')
})

app.listen(app.get('port'), function () {
	console.log(
		'Express server listening on http://localhost:' + app.get('port')
	)
})
