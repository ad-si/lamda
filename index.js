var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	things = require('./routes/things'),
	app = express()


app.set('views', __dirname + '/views')

app.get('/', things)

module.exports = app
