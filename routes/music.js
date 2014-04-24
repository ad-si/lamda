var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml'),
	music = {}


music.index = function (req, res) {
	res.render('index')
}

music.song = function (request, response, callback) {

	console.log('song')

	var path = ''

	//console.log(JSON.stringify(request, null, 2))
	//console.log(request)

	//response.send(music())

	//music(request, response, function (data) {
	//	response.send(data)
	//})

	//if(request.params)
	//	path = '/' + req.params[0]

	//files(path, function (data) {
	//	callback(data)
	//})
}

music.songs = function () {

	console.log('songs')

	var songs = [],
		artistDirs = fs.readdirSync(global.baseURL + '/Music'),
		artistCounter = artistDirs.length


	artistDirs.forEach(function (artistDir) {

		var filePath = global.baseURL + '/Music/' + artistDir

		fs.readFile(
			filePath,
			{encoding: 'utf-8'},
			function (error, fileContent) {

				if (error) throw error

				var jsonData = yaml.safeLoad(fileContent)

				jsonData.imageSource = '/img/things/' +
					path.basename(filePath, '.yaml') + '.jpg'

				things.push(jsonData)

				if (things.length === fileCounter) {

					res.render('index', {
						page: 'things',
						things: things
					})
				}
			}
		)
	})
}

music.artist = function () {

	console.artist('artist')
}

music.artists = function () {

	console.artists('artists')
}

module.exports = music
