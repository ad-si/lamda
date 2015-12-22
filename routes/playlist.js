'use strict'

let fs = require('fs')
let path = require('path')

let yaml = require('js-yaml')


module.exports = function (req, res) {

	var playlistPath = path.join(
			global.basePath,
			'sheetmusic',
			'playlists',
			req.params.id
		),
		playlistData = yaml.safeLoad(
			fs.readFileSync(
				path.join(playlistPath, 'index.yaml'),
				'utf-8'
			)
		)

	playlistData.songs = playlistData.songs.map(function (songId) {
		return {
			id: songId,
			url: global.baseURL + '/' + songId
		}
	})

	res.render('playlist', {
		page: 'playlist',
		playlist: playlistData
	})
}
