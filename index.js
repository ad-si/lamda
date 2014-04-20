var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	files = require('./routes/files'),
	app = express()


app.set('views', __dirname + '/views')

app.get(/(.*)/, files)

module.exports = app
