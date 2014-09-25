var fs = require('fs'),
    path = require('path'),

    yaml = require('js-yaml'),
    gm = require('gm')


module.exports = function (req, res) {

	var things = [],
	    dirs = fs.readdirSync(global.baseURL + '/things'),
	    numberOfDirectories = dirs.length


	dirs.forEach(function (dir, index) {

		var dirPath = global.baseURL + '/things/' + dir,
		    files,
		    images,
		    thumbDirectory,
		    thumbsDirectory


		if (fs.lstatSync(dirPath).isDirectory())
			files = fs.readdirSync(dirPath)

		else {
			numberOfDirectories--
			return
		}

		images = files.map(function (fileName) {

			if (fileName.search(/.+\.(jpg|png)$/gi) !== -1)
				return dir + '/' + fileName

			else
				return false
		})
		thumbDirectory = global.projectURL + '/thumbs'
		thumbsDirectory = thumbDirectory + '/things/' + dir


		function renderPage () {

			if (files.indexOf('index.yaml') === -1) {
				things.push({
					name: dir.replace(/_/g, ' '),
					images: images
				})

				if (things.length === numberOfDirectories)
					res.render('index', {
						page: 'things',
						things: things
					})
			}

			else
				fs.readFile(
					(dirPath + '/index.yaml'),
					{encoding: 'utf-8'},
					function (error, fileContent) {

						if (error) throw error

						var jsonData = yaml.safeLoad(fileContent)

						jsonData.images = images

						things.push(jsonData)


						if (things.length === numberOfDirectories)
							res.render('index', {
								page: 'things',
								things: things.sort(function (a, b) {
									a = a.dateOfPurchase || 0
									b = b.dateOfPurchase || 0

									return b - a
								})
							})
					}
				)
		}


		if (!fs.existsSync(thumbsDirectory)) {

			if (!fs.existsSync(thumbDirectory + '/things'))
				fs.mkdirSync(thumbDirectory + '/things')

			fs.mkdirSync(thumbsDirectory)


			images.forEach(function (imagePath, index) {

				if (imagePath === false)
					return

				gm(global.baseURL + '/things/' + imagePath)
					.autoOrient()
					.resize(200, 200)
					.noProfile()
					.write(global.projectURL + '/thumbs/things/' + imagePath, function (error) {

						if (error)
							throw error

						else
							console.log('Converted image: ' + imagePath)
					})
			})
		}

		renderPage()
	})
}
