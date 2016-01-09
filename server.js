'use strict'

const fs = require('fs')
const path = require('path')

const express = require('express')
const stylus = require('stylus')
const imageResizer = require('image-resizer-middleware')
const serveFavicon = require('serve-favicon')
const userHome = require('user-home')

global.basePath = global.basePath || userHome
global.projectPath = global.projectPath || __dirname
global.baseURL = '/things'
const thingsPath = path.join(global.basePath, 'things')
const publicPath = path.join(__dirname, 'public')
const viewsPath =  path.join(__dirname, 'views')
const stylesPath = path.join(publicPath, 'styles')
const modulesPath = path.join(__dirname, 'node_modules')

const things = require('./routes/things')
const thing = require('./routes/thing')

const app = express()
const isMounted = Boolean(module.parent)
const isDevMode = app.get('env') === 'development'


if (!isMounted) {
	global.baseURL = ''

	const faviconPath = path.join(publicPath, 'images/favicon.ico')
	app.use(serveFavicon(faviconPath))

	app.locals.styles = [{
		path: '/styles/dark.css',
		id: 'themeLink',
	}]
	app.use(stylus.middleware({
		src: path.join(modulesPath, 'lamda-styles/themes'),
		dest: stylesPath,
		debug: isDevMode,
		compress: !isDevMode,
	}))
}

app.use(stylus.middleware({
	src: stylesPath,
	debug: isDevMode,
	compress: !isDevMode,
}))
app.use(express.static(publicPath))

app.use(imageResizer.getMiddleware({
	basePath: thingsPath,
	thumbnailsPath: path.join(publicPath, 'thumbnails')
}))
app.use(express.static(thingsPath))
app.use('/node_modules', express.static(modulesPath))

app.set('views',viewsPath)

app.get('/', things)
app.get('/:id', thing)

module.exports = app

if (!isMounted) {
	const port = 3000
	app.set('view engine', 'jade')
	app.listen(port)
	console.log('App listens on http://localhost:' + port)
}
