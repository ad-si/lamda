var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	tasks = require('./routes/tasks'),
	errorHandler = require('errorhandler'),
	app = express()


app.set('views', __dirname + '/views')

app.get('/', tasks)
app.get('/:list', tasks)
app.post('/:list', tasks)


if (devMode)
	app.use(errorHandler())

module.exports = app
