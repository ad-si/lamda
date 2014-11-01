var fs = require('fs'),
    path = require('path'),

    yaml = require('js-yaml'),
    gm = require('gm'),
    util = require('../../../util'),
    songsPath = path.join(global.baseURL, 'sheetmusic', 'songs'),
    thumbsPath = path.join(global.projectURL, 'thumbs', 'sheetmusic')


function getImageUrl (fileName, name) {

	if (fileName.search(/.+\.(jpg|png)$/gi) !== -1)
		return '/' + name + '/' + fileName

	else
		return false
}


module.exports.song = function (req, res) {

	var requestedSongPath = path.join(songsPath, req.params.name),
	    files = fs.readdirSync(requestedSongPath),
	    images = files
		    .filter(util.isImage)
		    .map(function (fileName) {
			    return path.join(
				    '/thumbs',
				    'sheetmusic',
				    req.params.name, fileName
			    )
		    })

	function renderPage () {

		if (files.indexOf('index.yaml') === -1) {
			res.render('index', {
				page: 'sheetmusic',
				song: {
					id: req.params.name,
					images: images
				}
			})
		}

		else
			fs.readFile(
				path.join(requestedSongPath, 'index.yaml'),
				{encoding: 'utf-8'},
				function (error, fileContent) {

					if (error) throw error

					var jsonData = yaml.safeLoad(fileContent)
					jsonData.id = req.params.name
					jsonData.images = images

					res.render('index', {
						page: 'sheetmusic',
						song: jsonData
					})
				}
			)
	}

	renderPage()
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
			.filter(util.isImage)
			.map(function (fileName) {
				return path.join(songDir, fileName)
			})


		function renderPage () {

			//if (files.indexOf('index.yaml') === -1) {
			songs.push({
				id: songDir,
				images: images
			})

			if (songs.length === numberOfDirectories)
				res.render('index', {
					page: 'sheetmusic',
					songs: songs
				})
			//}

			/*
			 else
			 fs.readFile(
			 (dirPath + '/index.yaml'),
			 {encoding: 'utf-8'},
			 function (error, fileContent) {

			 if (error) throw error

			 var jsonData = yaml.safeLoad(fileContent)

			 jsonData.images = images

			 songs.push(jsonData)


			 if (songs.length === numberOfDirectories)
			 res.render('index', {
			 page: 'sheetmusic',
			 songs: songs
			 })
			 }
			 )
			 */
		}

		renderPage()
	})
}

module.exports.raw = function (req, res) {

	var files = fs.readdirSync(path.join(songsPath, req.params.name)),
	    songThumbsPath = path.join(thumbsPath, req.params.name),
	    imagesPath = '/sheetmusic/songs',
	    images = files
		    .filter(util.isImage)
		    .map(function (fileName) {
			    return path.join('/', req.params.name, fileName)
		    })

	if (!fs.existsSync(thumbsPath))
		fs.mkdirSync(thumbsPath)

	if (!fs.existsSync(songThumbsPath)) {

		fs.mkdirSync(songThumbsPath)


		images.forEach(function (imagePath) {

			if (imagePath === false)
				return

			gm(path.join(songsPath, imagePath))
				.resize(2200, 2200, '>')
				.noProfile()
				.write(path.join(thumbsPath, imagePath), function (error) {

					if (error)
						throw error

					else
						console.log('Converted image: ' + imagePath)
				})
		})
	}
	else
		imagesPath = '/thumbs/sheetmusic'

	res.render('raw', {
		page: 'raw',
		song: {
			id: req.params.name,
			images: images.map(function (imgPath) {
				return path.join(imagesPath + imgPath)
			})
		},
		style: req.query.style
	})
}

