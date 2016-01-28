const fs = require('fs')
const path = require('path')

const express = require('express')
const stylus = require('stylus')
const userHome = require('user-home')

const books = require('./routes/books')
const app = express()

global.basePath = global.basePath || userHome

app.use(express.static(path.join(global.basePath, 'books')))

app.set('views', path.join(__dirname, 'views'))

app.get('/', books.all)
app.get('/:book', books.one)
app.get('/:book.epub/*', books.cover)

module.exports = app
