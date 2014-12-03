var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	things = require('./routes/things'),
	thing = require('./routes/thing'),
	app = express()


app.use(express.static(path.join(global.baseURL, 'things')))

app.set('views', __dirname + '/views')

app.get('/', things)
app.get('/:id', thing())

module.exports = app
