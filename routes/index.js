var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml')

function isMovie (fileName) {
	return fileName.search(/.+\.(webm|mp4|m4v|mkv)$/gi) !== -1
}

module.exports = function (req, res) {

	var movies = [],
		rootEntries = fs.readdirSync(
			path.join(global.baseURL, 'movies')
		),
		numberOfRootEntries = rootEntries.length


	rootEntries.forEach(function (entry, index) {

		var absoluteEntryPath = path.join(
				global.baseURL,
				'movies',
				entry
			),
			movieObjects = []

		if (fs.lstatSync(absoluteEntryPath).isDirectory()) {
			movieObjects = fs.readdirSync(absoluteEntryPath)
				.filter(isMovie)
				.map(function (fileName) {
					return {
						title: path.basename(
							fileName,
							path.extname(fileName)
						),
						absolutePath: path.join(absoluteEntryPath, fileName),
						link: entry + '/' + fileName,
						type: 'video/x-matroska'
					}
				})
		}
		else if (isMovie(entry))
			movieObjects = [{
				title: entry,
				absolutePath: absoluteEntryPath,
				link: entry
			}]

		else {
			numberOfRootEntries--
			return
		}

		movieObjects.forEach(function (movieObject) {
			movies.push(movieObject)
		})
	})

	res.render('index', {
		page: 'Movies',
		movies: movies.sort(function (movieA, movieB) {
			if (movieA.title.toLowerCase() > movieB.title.toLowerCase())
				return 1
			else if (movieA.title.toLowerCase() < movieB.title.toLowerCase())
				return -1
			return 0
		})
	})
}
