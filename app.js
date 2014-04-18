var express = require('express'),
	nib = require('nib'),
	stylus = require('stylus'),
	path = require('path'),
	yaml = require('js-yaml'),
	app = express(),

	devMode = true, //(app.get('env') === 'development')
	config = yaml.safeLoad('./home/config'),

	api = require('./routes/api'),
	index = require('./routes/index'),
	settings = require('./routes/settings'),

	apps = {
		'Events': {
		},
		'Files': {
		},
		'Contacts': {
		},
		'Tasks': {
		},
		'Pictures': {
		},
		//'Music': {
		//},
		'Movies': {
		},
		'Books': {
		},
		'Docs': {
		},
		'Things': {
		},
		'Projects': {
		}
	}


for (var appName in apps) {
	if (apps.hasOwnProperty(appName))
		apps[appName].module = require('./routes/' + appName.toLowerCase())
}


function compile(str, path) {
	return stylus(str)
		.set('filename', path)
		.set('compress', !devMode)
		.use(nib())
		.import('nib')
}

// all environments
app.set('port', process.env.PORT || 2000)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(express.favicon())
app.use(express.logger('dev'))
app.use(express.compress())
app.use(express.bodyParser())
app.use(express.methodOverride())
app.use(app.router)
app.use(stylus.middleware({
	src: __dirname + '/public',
	compile: compile
}))
app.use(express.static(path.join(__dirname, 'public')))

if (devMode) app.use(express.errorHandler())

app.use(function (req, res, next) {

	res.status(404)

	if (req.accepts('html'))
		res.render('404.jade', { url: req.url })

	else if (req.accepts('json'))
		res.send({ error: 'Not found' })

	else
		res.type('txt').send('Not found')
})


app.set('baseURL', process.env.baseURL || __dirname + '/home')


// Native Apps
app.get('/', index)
app.get('/settings', settings)


// API
app.get('/api/events', api.events)
app.get(/\/api\/files(\/?.*)/, api.files)

//app.get('/api/music/songs', api.music.songs)
//app.get('/api/music/artists', api.music.artists)
//app.get('/api/music/:artist', api.music.artist)
//app.get('/api/music/:artist/:song', api.music.song)


// Custom Apps
app.get('/events', apps.Events.module)

app.get(/\/files(\/?.*)/, apps.Files.module)

app.get('/contacts', apps.Contacts.module)

app.get('/tasks', apps.Tasks.module)
app.get('/tasks/:list', apps.Tasks.module)

//app.get('/music', apps.Music.module.index)
//app.get('/music/songs', apps.Music.module.songs)
//app.get('/music/artists', apps.Music.module.artists)
//app.get('/music/:artist', apps.Music.module.artist)
//app.get('/music/:artist/:song', apps.Music.module.song)

app.get('/things', apps.Things.module)


app.locals.title = 'Lamda OS'
app.locals.scripts = [
	'/components/jquery/jquery.js',
	'/components/mousetrap/mousetrap.js',
	'/js/index.js'
]
app.locals.apps = apps


global.baseURL = '/Users/adrian/Sites/lamda/home'


app.listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'))
})
