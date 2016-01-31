const fs = require('fs')
const path = require('path')

const express = require('express')
const stylus = require('stylus')
const errorHandler = require('errorhandler')

const tasks = require('./routes/tasks')
const app = express()
const isDevMode = app.get('env') === 'development'
const runsStandalone = !Boolean(module.parent)
const projectDirectory = __dirname
const publicDirectory = path.join(projectDirectory, 'public')
const stylesDirectory = path.join(publicDirectory, 'styles')


function setupRouting () {
	app.use(stylus.middleware({
		src: stylesDirectory,
		debug: isDevMode,
		compress: !isDevMode,
	}))
	app.use(express.static(publicDirectory))
	app.set('views', path.join(projectDirectory, 'views'))
	app.get('/', tasks)
	app.get('/:taskView', tasks)
}


if (runsStandalone) {
	const morgan = require('morgan')
	app.use(morgan('dev', {skip: (request, repsonse) => !isDevMode}))

	const userHome = require('user-home')
	app.locals.basePath = userHome
	app.locals.baseURL = ''

	app.locals.styles = [{
		path: '/styles/dark.css',
		id: 'themeLink',
	}]
	app.use(stylus.middleware({
		src: path.join(projectDirectory, 'linked_modules/lamda-styles/themes'),
		dest: stylesDirectory,
		debug: isDevMode,
		compress: !isDevMode,
	}))

	const serveFavicon = require('serve-favicon')
	const faviconPath = path.join(publicDirectory, 'images/favicon.ico')
	app.use(serveFavicon(faviconPath))

	setupRouting()

	if (isDevMode)
		app.use(errorHandler())

	const port = 3000
	app.set('view engine', 'jade')
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
