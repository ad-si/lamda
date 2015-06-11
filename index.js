var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	imageResizer = require('image-resizer'),

	things = require('./routes/things'),
	thing = require('./routes/thing'),

	app = express()


app.use(imageResizer.middleware('things'))
app.use(express.static(path.join(global.baseURL, 'things')))

app.set('views', path.join(__dirname, 'views'))

app.get('/', things)
app.get('/:id', thing)

module.exports = app
