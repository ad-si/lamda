var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	sheetmusic = require('./routes/sheetmusic'),
	app = express()


app.use(express.static(path.join(global.baseURL, 'sheetmusic')))

app.set('views', __dirname + '/views')

app.get('/', sheetmusic.songs)
app.get('/:name', sheetmusic.song)

app.get('/raw/:name', sheetmusic.raw)

module.exports = app
