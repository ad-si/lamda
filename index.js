var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	index = require('./routes/index'),
	faviconServer = require('./routes/faviconServer'),
	app = express()


app.use(faviconServer)
app.use(express.static(path.join(global.baseURL, 'projects')))

app.set('views', __dirname + '/views')

app.get('/', index)

module.exports = app
