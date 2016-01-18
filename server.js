'use strict'

let fs = require('fs')
let path = require('path')

let express = require('express')
let stylus = require('stylus')
const serveFavicon = require('serve-favicon')

let events = require('./routes/events')

let app = express()
const isDevMode = (app.get('env') === 'development')


if (!module.parent) {
	app.use(serveFavicon(path.join(__dirname, 'public/images/favicon.ico')))

	app.locals.styles = [{
		path: '/styles/dark.css',
		id: 'themeLink',
	}]
	app.use(stylus.middleware({
		src: path.join(__dirname, 'linked_modules/lamda-styles/themes'),
		dest: path.join(__dirname, 'public/styles'),
		compress: !isDevMode,
	}))
}

app.use(stylus.middleware({
	src: path.join(__dirname, 'public/styles'),
	compress: !isDevMode,
}))
app.use(express.static(path.join(__dirname, 'public')))


app.set('views', __dirname + '/views')

app.get('/', events)

module.exports = app

if (!module.parent) {
	const port = 3000
	app.set('view engine', 'jade')
	app.listen(port)
	console.log('App listens on http://localhost:' + port)
}
