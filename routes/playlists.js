var fs = require('fs'),
	path = require('path'),

	yaml = require('js-yaml'),
	gm = require('gm')


module.exports.all = function (req, res) {

	var playlistsPath = path.join(global.baseURL, 'sheetmusic', 'playlists'),
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

module.exports.one = function (req, res) {

	var playlistPath = path.join(
			global.baseURL, 'sheetmusic', 'playlists', req.params.id
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
			url: path.join('/sheetmusic', songId)
		}
	})

	res.render('playlist', {
		page: 'playlist',
		playlist: playlistData
	})
}
