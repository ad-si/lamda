'use strict'

const fs = require('fs')
const path = require('path')

const yaml = require('js-yaml')


module.exports = function (req, res) {

	var playlistsPath = path.join(global.basePath, 'sheetmusic', 'playlists'),
		playlistDirs = fs.readdirSync(playlistsPath),
		playlists = []


	playlistDirs.forEach(function (playlistDir) {

		var playlistData

		try {
			playlistData = yaml.safeLoad(fs.readFileSync(
				path.join(playlistsPath, playlistDir, 'index.yaml'),
				'utf-8'
			))
		}
		catch (error) {

			if (error.code !== 'ENOTDIR')
				console.error(error)

			return
		}

		playlistData.id = playlistDir

		playlists.push(playlistData)
	})

	res.render('playlists', {
		page: 'playlists',
		playlists: playlists
	})
}
