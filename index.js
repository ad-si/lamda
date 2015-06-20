var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	index = require('./routes/index'),
	events = require('./routes/events'),
	photo = require('./routes/photo'),

	imageResizer = require('image-resizer')

	app = express()


app.use(imageResizer.middleware('photos'))
// TODO: Use dedicated subpath for image-loading
app.use(express.static(path.join(global.baseURL, 'photos')))
app.set('views', path.join(__dirname, 'views'))


app.get('/', index)
app.get('/:year', events.period)
app.get('/:year/:month', events.period)
app.get('/:year/:month/:day', events.period)
app.get('/:year/:month/:day/:event', events.event)
app.get('/:year/:month/:day/:event/:photo', photo)

module.exports = app
