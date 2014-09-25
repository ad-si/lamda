var fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml')

function isMovie (fileName) {
	return fileName.search(/.+\.(webm|mp4|m4v)$/gi) !== -1
}

module.exports = function (req, res) {


	var movies = [],
	    dirs = fs.readdirSync(global.baseURL + '/movies'),
	    numberOfDirectories = dirs.length


	dirs.forEach(function (dir, index) {

		var dirPath = global.baseURL + '/movies/' + dir,
		    movieFiles = []


		if (fs.lstatSync(dirPath).isDirectory())
			files = fs.readdirSync(dirPath)

		else {
			numberOfDirectories--
			return
		}


		movieFiles = files.filter(isMovie)

		if(movieFiles[0])
			movies.push({
				name: dir,
				link: '/movies/' + movieFiles.map(function (fileName) {
					return dir + '/' + fileName
				})[0] || ''
			})
	})

	res.render('index', {
		page: 'Movies',
		movies: movies
	})
}
