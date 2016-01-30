const fs = require('fs')
const path = require('path')

const express = require('express')
const stylus = require('stylus')
const userHome = require('user-home')
const serveFavicon = require('serve-favicon')

const contacts = require('./routes/contacts')
const app = express()
const isDevMode = app.get('env') === 'development'
const runsStandalone = !Boolean(module.parent)
const projectDirectory = __dirname
const publicDirectory = path.join(projectDirectory, 'public')


function setupRouting () {
	app.use(stylus.middleware({
		src: path.join(publicDirectory, 'styles'),
		debug: isDevMode,
		compress: !isDevMode,
	}))
	app.use(express.static(publicDirectory))

	app.set('views', path.join(projectDirectory, 'views'))

	app.get('/', contacts)
}

if (runsStandalone) {
	app.locals.basePath = userHome
	app.locals.baseURL = ''

	app.use(serveFavicon(path.join(publicDirectory, 'images/favicon.ico')))
	app.locals.styles = [{
		path: '/styles/dark.css',
		id: 'themeLink'
	}]
	app.use(stylus.middleware({
		src: path.join(projectDirectory, 'linked_modules/lamda-styles/themes'),
		dest: path.join(publicDirectory, 'styles'),
		debug: isDevMode,
		compress: !isDevMode,
	}))

	setupRouting()

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
