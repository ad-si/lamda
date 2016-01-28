var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	index = require('./routes/index'),
	faviconServer = require('./routes/faviconServer'),
	app = express()

const serveFavicon = require('serve-favicon')

const isMounted = Boolean(module.parent)
if (!isMounted) {
	app.locals.baseURL = ''
	const faviconPath = path.join(__dirname, 'public/images/favicon.ico')
}
app.use(faviconServer())
app.use(express.static(path.join(global.baseURL, 'projects')))

app.set('views', __dirname + '/views')

app.get('/', index)

module.exports = app
