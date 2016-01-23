const fs = require('fs')
const path = require('path')

const express = require('express')
const stylus = require('stylus')
const userHome = require('user-home')
const serveFavicon = require('serve-favicon')

const contacts = require('./routes/contacts')
const app = express()
const isDevMode = app.get('env') === 'development'
const isMounted = Boolean(module.parent)


if (!isMounted) {
	app.locals.baseURL = ''
	const faviconPath = path.join(__dirname, 'public/images/favicon.ico')

	app.use(serveFavicon(faviconPath))
	app.locals.styles = [{
		path: '/styles/dark.css',
		id: 'themeLink'
	}]
	app.use(stylus.middleware({
		src: path.join(__dirname, 'linked_modules/lamda-styles/themes'),
		dest: path.join(__dirname, 'public/styles'),
		debug: isDevMode,
		compress: !isDevMode,
	}))
}

app.use(stylus.middleware({
	src: path.join(__dirname, 'public/styles'),
	debug: isDevMode,
	compress: !isDevMode,
}))
app.use(express.static(path.join(__dirname, 'public')))

app.set('views', path.join(__dirname, '/views'))

app.get('/', contacts)

module.exports = app

if (!isMounted) {
	const port = 3000
	app.set('view engine', 'jade')
	app.listen(port)
	console.log('App listens on http://localhost:' + port)
}
