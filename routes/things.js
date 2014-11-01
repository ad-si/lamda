var fs = require('fs'),
    path = require('path'),

    yaml = require('js-yaml'),
    gm = require('gm'),
    util = require('../../../util')


module.exports = function (req, res) {

	var things = [],
	    dirs = fs
		    .readdirSync(global.baseURL + '/things')
		    .filter(function (dirName) {
			    return dirName[0] !== '.'
		    }),
	    numberOfDirectories = dirs.length,
	    view = 'standard',
	    defaultNames = ['front', 'overview', 'index', 'top']


	if (req.query.view === 'compact')
		view = 'compact'

	dirs
		.forEach(function (dir, index) {

			var dirPath = global.baseURL + '/things/' + dir,
			    files,
			    images,
			    mainImage,
			    thumbDirectory,
			    thumbsDirectory


			if (fs.lstatSync(dirPath).isDirectory())
				files = fs.readdirSync(dirPath)

			else {
				numberOfDirectories--
				return
			}

			// Use first picture matching a default name or otherwise a random one
			images = files.filter(util.isImage)

			images.some(function (imageName) {
				mainImage = dir + '/' + imageName

				return defaultNames.some(function (name) {

					return imageName.search(name) !== -1
				})
			})

			// TODO: Use this version as soon as node supports find
			/*.find(function (fileName) {

			 return defaultNames.find(function (name) {

			 if(fileName.search(name) === -1)
			 return false
			 else
			 return fileName
			 })
			 })
			 */

			thumbDirectory = global.projectURL + '/thumbs'
			thumbsDirectory = thumbDirectory + '/things/' + dir


			function renderPage () {

				function callRenderer () {
					res.render('index', {
						page: 'things',
						things: things.sort(function (a, b) {
							a = a.dateOfPurchase || 0
							b = b.dateOfPurchase || 0

							return b - a
						}),
						view: view,
						fortune: things
							.map(function (element) {
								return element.price
							})
							.reduce(function (previous, current) {


								if (previous) {
									if (typeof previous === 'string')
										previous = Number(previous.slice(0, -1))
								}
								else
									previous = 0

								if (current) {
									if (typeof current === 'string')
										current = Number(current.slice(0, -1))
								}
								else
									current = 0

								current = previous + current

								return current
							})
							.toFixed(2)
					})
				}

				if (files.indexOf('index.yaml') === -1) {
					things.push({
						name: dir.replace(/_/g, ' '),
						image: mainImage
					})

					if (things.length === numberOfDirectories)
						callRenderer()
				}
				else
					fs.readFile(
						(dirPath + '/index.yaml'),
						{encoding: 'utf-8'},
						function (error, fileContent) {

							if (error) throw error

							var jsonData = yaml.safeLoad(fileContent)

							jsonData.image = mainImage

							things.push(jsonData)


							if (things.length === numberOfDirectories)
								callRenderer()
						}
					)
			}

			// Cache images
			/*
			 if (!fs.existsSync(thumbsDirectory)) {

			 if (!fs.existsSync(thumbDirectory + '/things'))
			 fs.mkdirSync(thumbDirectory + '/things')

			 fs.mkdirSync(thumbsDirectory)


			 images.forEach(function (imageName, index) {

			 var imagePath = dir + '/' + imageName

			 if (imagePath === false)
			 return

			 gm(global.baseURL + '/things/' + imagePath)
			 .autoOrient()
			 .resize(200, 200)
			 .noProfile()
			 .write(
			 global.projectURL + '/thumbs/things/' + imagePath,
			 function (error) {

			 if (error)
			 throw error
			 else
			 console.log('Converted image: ' + imagePath)
			 })
			 })
			 }
			 */

			renderPage()
		}
	)
}
