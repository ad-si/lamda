var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	imageResizer = require('image-resizer'),

	things = require('./routes/things'),
	thing = require('./routes/thing'),

	app = express()
const isMounted = Boolean(module.parent)
const isDevMode = app.get('env') === 'development'


app.use(imageResizer.middleware('things'))
app.use(express.static(path.join(global.baseURL, 'things')))
if (!isMounted) {
	global.baseURL = ''

	const faviconPath = path.join(__dirname, 'public/images/favicon.ico')
	app.use(serveFavicon(faviconPath))

	app.locals.styles = [{
		path: '/styles/dark.css',
		id: 'themeLink',
	}]
	app.use(stylus.middleware({
		src: path.join(__dirname,'node_modules/lamda-styles/themes'),
		dest: path.join(__dirname, 'public/styles'),
		debug: isDevMode,
		compress: !isDevMode,
	}))
}

app.set('views', path.join(__dirname, 'views'))

app.get('/', things)
app.get('/:id', thing)

module.exports = app

if (!isMounted) {
	const port = 3000
	app.set('view engine', 'jade')
	app.listen(port)
	console.log('App listens on http://localhost:' + port)
}
