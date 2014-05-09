var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	index = require('./routes/index'),
	app = express()


app.set('views', __dirname + '/views')

app.get('/', index)

module.exports = app
