var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	index = require('./routes/index'),
	app = express()


app.use(express.static(path.join(global.baseURL, 'movies')))

app.set('views', __dirname + '/views')

app.get('/', index)

module.exports = app
	const faviconPath = path.join(publicDirectory, 'images/favicon.ico')
	app.use(serveFavicon(faviconPath))
