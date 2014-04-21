var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	books = require('./routes/books'),
	app = express()


app.set('views', __dirname + '/views')

app.get('/', books)

module.exports = app
