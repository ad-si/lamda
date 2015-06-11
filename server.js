var express = require('express'),
	errorHandler = require('errorhandler'),
	favicon = require('serve-favicon'),
	methodOverride = require('method-override'),
	compress = require('compression'),
	logger = require('morgan'),
	stylus = require('stylus'),
	path = require('path'),
	yaml = require('js-yaml'),
	fs = require('fs'),
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
			path: '/styles/themes/dark.css',
			id: 'themeLink'
		}
	],
	title = 'Lamda OS',
	name,
	projectPath = __dirname,
	locals


global.baseURL = process.env.LAMDA_HOME || __dirname
global.projectURL = projectPath
global.devMode = app.get('env') === 'development'
global.config = yaml.safeLoad(
	fs.readFileSync(path.join(global.baseURL, 'config.yaml'), 'utf-8')
)

locals = {
	title: title,
	scripts: scripts,
	styles: styles,
	config: global.config
}

loadedApps = appLoader(app, locals)

app.locals = locals
app.locals.appNames = Object.keys(loadedApps)


// All environments
app.set('port', process.env.PORT || 2000)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(favicon(path.normalize('public/img/favicon.png')))
app.use(logger('dev'))
app.use(compress())
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


for (name in loadedApps) {
	if (loadedApps.hasOwnProperty(name)) {

		app.use(
			'/assets/' + name + '/public',
			stylus.middleware({
				src: path.join(loadedApps[name].lamda.path, 'public'),
				compile: function (string, path) {
					return utils.compileStyl(
						string,
						path,
						global.config.theme
					)
				}
			}),
			express.static(path.join(loadedApps[name].lamda.path, 'public'))
		)

		app.use(
			'/assets/' + name + '/modules',
			express.static(
				path.join(loadedApps[name].lamda.path, 'node_modules')
			)
		)
	}
}

app.use(stylus.middleware({
	src: 'public',
	compile: function (string, path) {
		return utils.compileStyl(string, path, global.config.theme)
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
		res.send({error: 'Not found'})

	else
		res.type('txt').send('Not found')
})

app.listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'))
})
