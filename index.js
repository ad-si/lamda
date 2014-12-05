var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	index = require('./routes/index'),
	events = require('./routes/events'),
	app = express()


app.set('views', __dirname + '/views')

app.get('/', index)
app.get('/:year', events.year)
app.get('/:year/:month', events.month)
app.get('/:year/:month/:day', events.day)
app.get('/:year/:month/:day/:event', events.event)

module.exports = app
