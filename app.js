var express = require('express'),
	nib = require('nib'),
	stylus = require('stylus'),
	path = require('path'),
	yaml = require('js-yaml'),
	app = express(),

	api = require('./routes/api'),
	index = require('./routes/index'),
	files = require('./routes/files'),
	tasks = require('./routes/tasks'),
	contacts = require('./routes/contacts'),
	events = require('./routes/events'),
	settings = require('./routes/settings'),
	things = require('./routes/things'),
	devMode = true, //(app.get('env') === 'development')
	config = yaml.safeLoad('./home/config')

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

app.use(function(req, res, next){

	res.status(404)

	if (req.accepts('html'))
		res.render('404.jade', { url: req.url })

	else if (req.accepts('json'))
		res.send({ error: 'Not found' })

	else
		res.type('txt').send('Not found')
})



app.set('baseURL', process.env.baseURL || __dirname + '/home')


app.get('/', index)

app.get('/api/events', api.events)
app.get(/\/api\/files(\/?.*)/, api.files)

app.get('/events', events)
app.get(/\/files(\/?.*)/, files)
app.get('/contacts', contacts)
app.get('/tasks', tasks)
app.get('/tasks/:list', tasks)
app.get('/settings', settings)
app.get('/things', things)


app.locals.title = 'Lamda OS'
app.locals.scripts = [
	'/components/jquery/jquery.js',
	'/components/mousetrap/mousetrap.js',
	'/js/index.js'
]

app.locals.apps = [
	'Events',
	'Files',
	'Contacts',
	'Tasks',
	'Pictures',
	'Music',
	'Movies',
	'Docs',
	'Things',
	'Projects'
]


global.baseURL = '/Users/adrian/Sites/lamda/home'


app.listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'))
})
