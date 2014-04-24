var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	music = require('./routes/music'),
	app = express()


app.set('views', __dirname + '/views')

app.get('/', music.index)
app.get('/songs', music.songs)
app.get('/artists', music.artists)
app.get('/:artist', music.artist)
//app.get('/:artist/:song', music.song)

module.exports = app
