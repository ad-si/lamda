var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	tasks = require('./routes/tasks'),
	app = express()


app.set('views', __dirname + '/views')

app.get('/', tasks)
app.get('/:list', tasks)

module.exports = app
