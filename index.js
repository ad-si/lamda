var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	index = require('./routes/index'),
	events = require('./routes/events'),

	// TODO: Move imageResizer to lamda
	imageResizer = require('../Things/routes/imageResizer')

	app = express()


app.use(imageResizer.middleware('photos'))
app.use(express.static(path.join(global.baseURL, 'photos')))
app.set('views', __dirname + '/views')


app.get('/', index)
app.get('/:year', events.period)
app.get('/:year/:month', events.period)
app.get('/:year/:month/:day', events.period)
app.get('/:year/:month/:day/:event', events.event)

module.exports = app
