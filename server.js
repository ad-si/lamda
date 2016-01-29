const fs = require('fs')
const path = require('path')

const express = require('express')
const stylus = require('stylus')

const setupRouting = require('./modules/setupRouting')

const app = express()
const isDevMode = app.get('env') === 'development'
const runsStandalone = !Boolean(module.parent)


if (runsStandalone) {
	const morgan = require('morgan')
	app.use(morgan('dev', {skip: (request, repsonse) => !isDevMode}))

	const userHome = require('user-home')
	app.locals.basePath = userHome
	app.locals.baseURL = ''

	const serveFavicon = require('serve-favicon')
	const faviconPath = path.join(__dirname, 'public/images/favicon.ico')
	app.use(serveFavicon(faviconPath))

	app.locals.styles = [{
		path: '/styles/dark.css',
		id: 'themeLink',
	}]
	app.use(stylus.middleware({
		src: path.join(__dirname, 'linked_modules/lamda-styles/themes'),
		dest: path.join(__dirname, 'public/styles'),
		debug: isDevMode,
		compress: !isDevMode,
	}))

	setupRouting(app)

	const port = 3000
	app.set('view engine', 'jade')
	app.listen(port)
	console.log('App listens on http://localhost:' + port)
}
else {
	module.exports = (locals) => {
		app.locals = locals
		setupRouting(app)
		return app
	}

	module.exports.isCallback = true
}
