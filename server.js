'use strict'

const fs = require('fs')
const path = require('path')

const express = require('express')
const serveFavicon = require('serve-favicon')
const stylus = require('stylus')
const userHome = require('user-home')
const lilyware = require('lilyware')

const pieces = require('./routes/pieces')
const piece = require('./routes/piece')
const raw = require('./routes/raw')
const playlist = require('./routes/playlist')
const playlists = require('./routes/playlists')

const app = express()

global.basePath = global.basePath || userHome
global.baseURL = '/sheetmusic'
const songsPath = path.join(global.basePath, 'sheetmusic', 'songs')
const playlistsPath = path.join(global.basePath, 'sheetmusic', 'playlists')
const thumbsPath = global.projectURL ?
	path.join(global.projectURL, 'thumbs', 'sheetmusic') :
	path.join(__dirname, 'public', 'thumbs')


if (!module.parent) {
	const fontsPath = path.join(
		__dirname,
		'node_modules/lamda-styles/build/font/fonts'
	)
	const faviconPath = path.join(__dirname, 'public/images/favicon.ico')

	global.baseURL = ''
	app.use(serveFavicon(faviconPath))
	app.use(
		stylus.middleware({
			src: path.join(__dirname, 'node_modules/lamda-styles/themes'),
			dest: path.join(__dirname, 'public/styles'),
			compress: app.get('env') !== 'development'
		})
	)
	app.use('/fonts', express.static(fontsPath))
	app.use(express.static('public'))
	app.locals.styles = [{
		path: '/styles/dark.css',
		id: 'themeLink'
	}]
}

app.use(lilyware(songsPath))
app.use(express.static(songsPath))

app.set('views', path.join(__dirname, 'views'))

app.get('/', pieces(songsPath, thumbsPath))

app.get('/playlists', playlists(playlistsPath))
app.get('/playlist/:id', playlist(playlistsPath))

app.get('/:name', piece(songsPath, thumbsPath))
app.get('/:name/raw', raw(songsPath, thumbsPath))

module.exports = app

if (!module.parent) {
	const port = 3000
	app.set('view engine', 'jade')
	app.listen(port)
	console.log('App listens on http://localhost:' + port)
}
