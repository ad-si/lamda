'use strict'

const fs = require('fs')
const path = require('path')

const express = require('express')
const stylus = require('stylus')
// const imageResizer = require('image-resizer-middleware')
const serveFavicon = require('serve-favicon')
const userHome = require('user-home')

global.basePath = global.basePath || userHome
global.projectPath = global.projectPath || userHome
global.baseURL = '/things'

const things = require('./routes/things')
const thing = require('./routes/thing')

const app = express()
const isMounted = Boolean(module.parent)
const isDevMode = app.get('env') === 'development'


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

// app.use(imageResizer.middleware('things'))
app.use(express.static(path.join(global.basePath, 'things')))

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
