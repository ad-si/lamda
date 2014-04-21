var fs = require('fs'),
	path = require('path'),

	yaml = require('js-yaml')


module.exports = function (req, res) {

	var things = [],
		files = fs.readdirSync(global.baseURL + '/things'),
		fileCounter = files.length


	files.forEach(function (file) {

		if (path.extname(file) === '.yaml') {

			var filePath = global.baseURL + '/things/' + file

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
				})
		}
		else
			fileCounter--
	})
}
