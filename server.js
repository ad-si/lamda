'use strict'

const fs = require('fs')
const path = require('path')

const express = require('express')
const serveFavicon = require('serve-favicon')
const stylus = require('stylus')
const userHome = require('user-home')
const lilyware = require('lilyware')

const sheetmusic = require('./routes/sheetmusic')
const playlist = require('./routes/playlist')
const playlists = require('./routes/playlists')

const app = express()

global.basePath = global.basePath || userHome
global.baseURL = global.baseURL || ''
const songsPath = path.join(global.basePath, 'sheetmusic', 'songs')

if (!module.parent) {
	app.use(serveFavicon(
		path.join(__dirname, 'public', 'images', 'favicon.ico')
	))
	app.use(express.static('public'))
}

app.use(lilyware(songsPath))
app.use(express.static(songsPath))

app.set('views', __dirname + '/views')

app.get('/', sheetmusic.songs)

app.get('/playlists', playlists)
app.get('/playlist/:id', playlist)

app.get('/:name', sheetmusic.song)
app.get('/raw/:name', sheetmusic.raw)

module.exports = app

if (!module.parent) {
	app.set('view engine', 'jade')
	var port = 3000
	app.listen(3000)
	console.log('App listens on http://localhost:' + port)
}
