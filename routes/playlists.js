'use strict'

const fs = require('fs')
const path = require('path')

const yaml = require('js-yaml')


module.exports = function (playlistsPath) {

	return function (req, res) {

		const playlistDirs = fs.readdirSync(playlistsPath)
		const playlists = []

		playlistDirs.forEach(function (playlistDir) {
			try {
				const playlistData = yaml.safeLoad(fs.readFileSync(
					path.join(playlistsPath, playlistDir, 'index.yaml'),
					'utf-8'
				))

				playlistData.id = playlistDir

				playlists.push(playlistData)
			}
			catch (error) {
				if (error.code !== 'ENOTDIR')
					console.error(error)
			}
		})

		res.render('playlists', {
			page: 'playlists',
			playlists: playlists
		})
	}
}
