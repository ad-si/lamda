var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),

	books = require('./routes/books'),

	app = express()


app.use(express.static(path.join(global.baseURL, 'books')))

app.set('views', __dirname + '/views')

app.get('/', books.all)
app.get('/:book', books.one)
app.get('/:book.epub/*', books.cover)

module.exports = app
