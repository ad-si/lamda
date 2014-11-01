var fs = require('fs'),
    path = require('path'),

    yaml = require('js-yaml'),
    gm = require('gm'),
    util = require('../../../util')


function getImageUrl (fileName, name) {

	if (fileName.search(/.+\.(jpg|png)$/gi) !== -1)
		return '/' + name + '/' + fileName

	else
		return false
}

module.exports.songs = function (req, res) {

	var songs = [],
	    dirs = fs.readdirSync(global.baseURL + '/sheetmusic'),
	    numberOfDirectories = dirs.length


	dirs.forEach(function (dir, index) {

		var dirPath = global.baseURL + '/sheetmusic/' + dir,
		    files,
		    images,
		    thumbDirectory,
		    thumbsDirectory


		if (fs.lstatSync(dirPath).isDirectory() && dir[0] !== '.')
			files = fs.readdirSync(dirPath)

		else {
			numberOfDirectories--
			return
		}

		images = files
			.filter(util.isImage)
			.map(function (fileName) {
				return dir + '/' + fileName
			})


		function renderPage () {

			//if (files.indexOf('index.yaml') === -1) {
				songs.push({
					name: dir,
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

module.exports.song = function (req, res) {

	var dirPath = path.join(global.baseURL, 'sheetmusic', req.params.name),
	    files = fs.readdirSync(dirPath),
	    images = files
		    .filter(util.isImage)
		    .map(function (fileName) {
			    return path.join(
				    '/thumbs',
				    'sheetmusic',
				    req.params.name, fileName
			    )
		    })

	console.log(dirPath)

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
				(dirPath + '/index.yaml'),
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

module.exports.raw = function (req, res) {

	var files = fs.readdirSync(global.baseURL + '/sheetmusic/' + req.params.name),
	    images = files
		    .filter(util.isImage)
		    .map(function (fileName) {
			    return '/' + req.params.name + '/' + fileName
		    }),
	    thumbsPath = global.projectURL + '/thumbs/sheetmusic',
	    songThumbsPath = thumbsPath + '/' + req.params.name,
	    imagesPath = '/thumbs/sheetmusic'


	if (!fs.existsSync(thumbsPath))
		fs.mkdirSync(thumbsPath)

	if (!fs.existsSync(songThumbsPath)) {

		fs.mkdirSync(songThumbsPath)


		images.forEach(function (imagePath, index) {

			if (imagePath === false)
				return

			// TODO: Only convert when original image is larger
			gm(global.baseURL + '/sheetmusic/' + imagePath)
				.resize(2200, 2200, '>')
				.noProfile()
				.write(thumbsPath + '/' + imagePath, function (error) {

					if (error)
						throw error

					else
						console.log('Converted image: ' + imagePath)
				})
		})

		imagesPath = '/sheetmusic'
	}

	res.render('raw', {
		page: 'raw',
		song: {
			name: req.params.name,
			images: images.map(function (path) {
				return imagesPath + path
			})
		},
		style: req.query.style
	})
}

