var express = require('express'),
	nib = require('nib'),
	stylus = require('stylus'),
	path = require('path'),
	app = express(),

	api = require('./routes/api'),
	index = require('./routes/index'),
	explorer = require('./routes/explorer'),
	tasks = require('./routes/tasks'),
	contacts = require('./routes/contacts')


function compile(str, path) {
	return stylus(str)
		.set('filename', path)
		.set('compress', false)
		.use(nib())
		.import('nib')
}

// all environments
app.set('port', process.env.PORT || 2000)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(express.favicon())
app.use(express.logger('dev'))
app.use(express.bodyParser())
app.use(express.methodOverride())
app.use(app.router)
app.use(stylus.middleware({
	src: __dirname + '/public',
	compile: compile
}))
app.use(express.static(path.join(__dirname, 'public')))

//if (app.get('env') === 'development') {
app.use(express.errorHandler())
//}


app.get('/', index)

app.get(/\/api\/files(\/?.*)/, api.files)

app.get(/\/explorer(\/?.*)/, explorer)
app.get('/contacts', contacts)
app.get('/tasks', tasks)
app.get('/tasks/:list', tasks)


app.locals.title = 'Lamda OS'
app.locals.scripts = [
	'/components/jquery/jquery.js',
	'/components/mousetrap/mousetrap.js',
	'/js/index.js'
]


app.listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'))
})
