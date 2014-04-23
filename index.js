var fs = require('fs'),
	express = require('express'),
	stylus = require('stylus'),
	path = require('path'),
	app = express()


app.set('views', __dirname + '/views')


app.get('/', function (request, response) {
	response.render('index')
})

//app.get('/music', apps.Music.module.index)
//app.get('/music/songs', apps.Music.module.songs)
//app.get('/music/artists', apps.Music.module.artists)
//app.get('/music/:artist', apps.Music.module.artist)
//app.get('/music/:artist/:song', apps.Music.module.song)

module.exports = app
