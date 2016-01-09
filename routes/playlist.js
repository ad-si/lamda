'use strict'

const fs = require('fs')
const path = require('path')

const yaml = require('js-yaml')


module.exports = function (playlistsPath, baseURL) {

	return function (req, res) {

		const playlistPath = path.join(playlistsPath, req.params.id)
		const playlistData = yaml.safeLoad(
			fs.readFileSync(
				path.join(playlistPath, 'index.yaml'),
				'utf-8'
			)
		)

		playlistData.songs = playlistData.songs.map(function (songId) {
			return {
				id: songId,
				url: baseURL + '/' + songId
			}
		})

		res.render('playlist', {
			page: 'playlist',
			playlist: playlistData
		})
	}
}
