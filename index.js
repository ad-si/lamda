var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),

	index = require('./routes/index'),
	music = require('./routes/music'),
	app = express()


app.use('/raw', express.static(path.join(global.baseURL, 'music')))

app.set('views', __dirname + '/views')


app.get('/api/artists', music.artists)
app.get('/api/artists/:artistId', music.artist)
app.get('/api/artists/:artistId/songs', music.songs)
app.get('/api/artists/:artistId/songs/:songId', music.song)

app.get('/api/songs', music.songs)

app.get('*', index)

module.exports = app
