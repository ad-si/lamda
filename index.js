var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	app = express()


app.set('views', __dirname + '/views')


app.get('/', function (request, response) {
	response.render('index')
})

module.exports = app
