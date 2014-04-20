var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	events = require('./routes/events'),
	app = express()


app.set('views', __dirname + '/views')

app.get('/', events)

module.exports = app
