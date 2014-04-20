var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	contacts = require('./routes/contacts'),
	app = express()


app.set('views', __dirname + '/views')

app.get('/', contacts)

module.exports = app
