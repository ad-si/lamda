var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	tasks = require('./routes/tasks'),
	bodyParser = require('body-parser'),
	errorHandler = require('errorhandler'),
	app = express()


app.set('views', __dirname + '/views')

app.use(bodyParser())

app.get('/', tasks)
app.get('/:list', tasks)
app.post('/:list', tasks)


if (devMode)
	app.use(errorHandler())

module.exports = app
