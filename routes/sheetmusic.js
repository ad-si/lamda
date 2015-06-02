var fs = require('fs'),
	path = require('path'),

	yaml = require('js-yaml'),

	utils = require('../../../utils'),
	imageResizer = require('../../../modules/imageResizer'),

	songsPath = path.join(global.baseURL, 'sheetmusic', 'songs'),
	thumbsPath = path.join(global.projectURL, 'thumbs', 'sheetmusic')


function getImagesFromFilesForSong (files, songName) {

	return files
		.filter(utils.isImage)
		.map(function (fileName) {

			var imagePath = '/sheetmusic/' + songName + '/' + fileName,
				thumbnailPath = '/thumbs' + imagePath,
				image = {
					path: imagePath,
					thumbnailPath: thumbnailPath,
					absPath: path.join(songsPath, songName, fileName),
					absThumbnailPath: path.join(thumbsPath, songName, fileName),
					maxWidth: 2000,
					maxHeight: 2000
				}

			createThumbnail(songName, image)

			return image
		})
}


function getLilypondFilesObjects (files, songName) {

	return files
		.filter(utils.isLilypondFile)
		.map(function (fileName) {

			var filePath = '/sheetmusic/' + songName + '/' + fileName,
				lilypondObject = {
					path: filePath,
					absPath: path.join(songsPath, songName, fileName)
				}

			return lilypondObject
		})
}

function createThumbnail (songName, image) {

	var songThumbsPath = path.join(thumbsPath, songName)

	if (!fs.existsSync(thumbsPath))
		fs.mkdirSync(thumbsPath)

	if (!fs.existsSync(songThumbsPath))
		fs.mkdirSync(songThumbsPath)

	imageResizer.addToQueue(image)

	return true
}


module.exports.song = function (req, res) {

	var songId = req.params.name,
		requestedSongPath = path.join(songsPath, songId),
		files = fs.readdirSync(requestedSongPath),
		images = getImagesFromFilesForSong(files, songId),
		lilypondFiles = getLilypondFilesObjects(files, songId)


	if (files.indexOf('index.yaml') === -1)
		res.render('index', {
			page: 'sheetmusic',
			song: {
				id: songId,
				name: songId.replace(/_/g, ' ').replace(/-/g, ' - '),
				images: images,
				lilypondFiles: lilypondFiles
			}
		})

	else
		fs.readFile(
			path.join(requestedSongPath, 'index.yaml'),
			{encoding: 'utf-8'},
			function (error, fileContent) {

				if (error) throw error

				var jsonData = yaml.safeLoad(fileContent)

				jsonData.id = req.params.name
				jsonData.images = images
				jsonData.lilypondFiles = lilypondFiles

				res.render('index', {
					page: 'sheetmusic',
					song: jsonData
				})
			}
		)
}

module.exports.songs = function (req, res) {

	var songs = [],
		songDirs = fs.readdirSync(songsPath),
		numberOfDirectories = songDirs.length


	songDirs.forEach(function (songDir, index) {

		var dirPath = path.join(songsPath, songDir),
			files,
			images


		if (fs.lstatSync(dirPath).isDirectory() && songDir[0] !== '.')
			files = fs.readdirSync(dirPath)

		else {
			numberOfDirectories--
			return
		}

		images = files
			.filter(utils.isImage)
			.map(function (fileName) {
				return path.join(songDir, fileName)
			})


		function renderPage () {

			songs.push({
				id: songDir,
				images: images
			})

			if (songs.length === numberOfDirectories)
				res.render('index', {
					page: 'sheetmusic',
					songs: songs
				})
		}

		renderPage()
	})
}

module.exports.raw = function (req, res) {

	var songId = req.params.name,
		files = fs.readdirSync(path.join(songsPath, songId)),
		images = getImagesFromFilesForSong(files, songId)


	res.render('raw', {
		page: 'raw',
		song: {
			id: songId,
			images: images
		},
		style: req.query.style
	})
}
