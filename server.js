const fs = require('fs')
const path = require('path')

const express = require('express')
const stylus = require('stylus')
const userHome = require('user-home')
const serveFavicon = require('serve-favicon')
const browserifyMiddleware = require('browserify-middleware')


const contacts = require('./routes/contacts')
const dataExport = require('./routes/export')
const app = express()
const isDevMode = app.get('env') === 'development'
const runsStandalone = !Boolean(module.parent)
const projectDirectory = __dirname
const publicDirectory = path.join(projectDirectory, 'public')
const scriptsDirectory = path.join(publicDirectory, 'scripts')


function setupRouting () {
	app.use(stylus.middleware({
		src: path.join(publicDirectory, 'styles'),
		compile: (stylusString, filePath) => stylus(stylusString)
			.set('filename', filePath)
			.set('compress', !isDevMode)
			.set('sourcemap', isDevMode)
			.define('providers', fs
				.readdirSync(
					path.join(publicDirectory, 'images/email-provider')
				)
				.map(fileName => fileName.replace(/\.png$/gi, ''))
			)
	}))

	app.use('/scripts', browserifyMiddleware(scriptsDirectory))

	app.use(express.static(publicDirectory))

	app.set('views', path.join(projectDirectory, 'views'))

	app.get('/', contacts)
	app.get('/export', dataExport)
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
