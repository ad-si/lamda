var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),

	index = require('./routes/index'),
	music = require('./routes/music'),
	app = express()


app.set('views', __dirname + '/views')


app.get('/api/artists', music.artists)
app.get('/api/artists/:artistId', music.artist)
app.get('/api/artists/:artistId/songs', music.songs)

app.get('/api/songs', music.songs)
app.get('/api/songs/:songId', music.song)

app.get('*', index)

module.exports = app
