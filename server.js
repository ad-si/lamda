'use strict'

const fs = require('fs')
const path = require('path')

const express = require('express')
const stylus = require('stylus')
const imageResizer = require('image-resizer-middleware')
const serveFavicon = require('serve-favicon')
const userHome = require('user-home')

const publicPath = path.join(__dirname, 'public')
const viewsPath =  path.join(__dirname, 'views')
const stylesPath = path.join(publicPath, 'styles')
const modulesPath = path.join(__dirname, 'node_modules')

const things = require('./routes/things')
const thing = require('./routes/thing')

const app = express()
app.locals.baseURL = '/things'
const isMounted = Boolean(module.parent)
const isDevMode = app.get('env') === 'development'


function setupRouting () {
	app.use(stylus.middleware({
		src: stylesPath,
		debug: isDevMode,
		compress: !isDevMode,
	}))
	app.use(express.static(publicPath))

	const thingsPath = path.join(app.locals.basePath, 'things')
	app.use(imageResizer.getMiddleware({
		basePath: thingsPath,
		thumbnailsPath: path.join(publicPath, 'thumbnails')
	}))
	app.use(express.static(thingsPath))
	app.use('/node_modules', express.static(modulesPath))

	app.set('views', viewsPath)

	app.get('/', things(app.locals.baseURL))
	app.get('/:id', thing)
}

if (!isMounted) {
	app.locals.baseURL = ''

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

	setupRouting()

	const port = 3000
	app.set('view engine', 'pug')
	app.listen(port)
	console.log('App listens on http://localhost:' + port)
}
else {
	module.exports = (locals) => {
		app.locals = locals
		setupRouting()
		return app
	}

	module.exports.isCallback = true
}
