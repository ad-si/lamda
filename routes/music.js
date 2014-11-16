var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml'),

	util = require('../../../util'),

	musicDir = path.join(global.baseURL, 'music'),
	music = {}




music.song = function (request, response) {

	var songId = request.params.songId

	response.send({
		id: songId,
		title: util.removeFileExtension(songId),
		trackArtist: request.params.artistId,
		lyrics: 'Foo bar',
		src: path.join('/music/raw/', request.params.artistId, songId)
	})
}

music.songs = function (request, response) {

	var songs = [],
		artistId = request.params.artistId

	if (artistId) {

		songs = fs
			.readdirSync(path.join(musicDir, artistId))
			.filter(util.isSong)
			.map(function (songId) {
				return {
					id: songId,
					title: util.removeFileExtension(songId)
				}
			})

		response.send({songs: songs})
	}

	else {

		response.send({songs: []})

		/*
		 artistDirs.forEach(function (artistDir) {

		 var filePath = path.join(global.baseURL, 'music', artistDir)

		 fs.readFile(
		 filePath,
		 {encoding: 'utf-8'},
		 function (error, fileContent) {

		 if (error) throw error

		 // TODO

		 if (songs.length === artistCounter) {

		 response.render('index', {
		 page: 'things',
		 songs: songs
		 })
		 }
		 }
		 )
		 })
		 */
	}

}

music.artist = function (request, response) {

	response.send({
		id: request.params.artistId,
		name: request.params.artistId
	})
}

music.artists = function (request, response) {

	var artistDirs = fs.readdirSync(musicDir),
		artistsCounter = artistDirs.length,
		artists = []

	artistDirs.forEach(function (artistDir) {

		fs.lstat(path.join(musicDir, artistDir), function (error, stats) {

				if (error) throw new Error(error)

				if (stats.isDirectory())
					artists.push({
						id: artistDir,
						name: artistDir
					})
				else
					artistsCounter--

				if (artists.length === artistsCounter)
					response.send({artists: artists})
			}
		)
	})
}

module.exports = music
