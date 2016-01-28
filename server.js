const fs = require('fs')
const path = require('path')

const express = require('express')
const stylus = require('stylus')
const userHome = require('user-home')

const books = require('./routes/books')
const app = express()
const isDevMode = app.get('env') === 'development'
const isMounted = Boolean(module.parent)

global.basePath = global.basePath || userHome

if (!isMounted) {
	const morgan = require('morgan')
	app.use(morgan('dev', {skip: (request, repsonse) => !isDevMode}))

	app.locals.baseURL = ''

	const serveFavicon = require('serve-favicon')
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
app.use(express.static(path.join(global.basePath, 'books')))
app.use('/linked_modules', express.static(
	path.join(__dirname, 'linked_modules'))
)

app.set('views', path.join(__dirname, 'views'))

app.get('/', books.all)
app.get('/:book', books.one)
app.get('/:book.epub/*', books.cover)

module.exports = app

if (!isMounted) {
	const port = 3000
	app.set('view engine', 'jade')
	app.listen(port)
	console.log('App listens on http://localhost:' + port)
}
