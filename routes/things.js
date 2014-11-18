var fs = require('fs'),
	path = require('path'),

	yaml = require('js-yaml'),
	gm = require('gm'),
	util = require('../../../util'),

	thingsDir = path.join(global.baseURL, 'things'),
	thumbDirectory = path.join(global.projectURL, 'thumbs')


fs.mkdir(path.join(thumbDirectory, 'things'), function (error) {

	if (error && error.code !== 'EEXIST')
		throw new Error(error)
})


function callRenderer (res, things, view) {

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


module.exports = function (req, response) {

	var view = (req.query.view === 'compact') ? 'compact' : 'standard',
		defaultNames = ['front', 'overview', 'index', 'top'],
		things = [],
		thumbsDirectory = path.join(thumbDirectory, 'things', 'dir')


	function loadThings (callback) {

		fs.readdir(thingsDir, function (error, thingDirs) {

			var numberOfThings = thingDirs.length

			if (error) {
				callback(error)
				return
			}

			thingDirs.forEach(function (thingDir) {

				var thing = {}


				function loadFiles (callback) {

					var images = [],
						indexData

					fs.readdir(
						path.join(thingsDir, thingDir),
						function (error, files) {

							var numberOfFiles = files.length

							if (error) {
								console.error(error)
								return
							}

							files.forEach(function (file) {

								if (util.isImage(file))
									images.push(file)
								else
									numberOfFiles--

								function checkImagesLoadStatus () {
									if (images.length === numberOfFiles)
										callback(null, images, indexData)
								}

								if (file === 'index.yaml')
									fs.readFile(
										path.join(thingsDir, thingDir, 'index.yaml'),
										{encoding: 'utf-8'},
										function (error, fileContent) {

											if (error) {
												console.error(error)
												return
											}

											indexData = yaml.safeLoad(fileContent)

											checkImagesLoadStatus()
										}
									)
								else
									checkImagesLoadStatus()

							})
						}
					)
				}


				if (thingDir[0] === '.') {
					numberOfThings--
					return
				}

				loadFiles(function (error, images, indexData) {

					var imagePath = path.join(thingDir, (images[0] || '')),
						imageThumbnailPath = path.join(
							'thumbs',
							'things',
							imagePath
						)

					if (error) {
						callback(error)
						return
					}

					thing = indexData || thing

					thing.name = thingDir.replace(/_/g, ' ')


					fs.exists(imageThumbnailPath, function (exists) {

						if (exists) return

						fs.mkdir(
							path.join(thumbDirectory, 'things', thingDir),
							function (error) {

								if (error && error.code !== 'EEXIST') {
									callback(error)
									return
								}

								gm(path.join(thingsDir, imagePath))
									.resize(200, 200, '>')
									.noProfile()
									.write(
									path.join(global.projectURL, imageThumbnailPath),
									function (error) {

										if (error) {
											callback(error)
											return
										}

										console.log(
											'Created thumbnail for', imagePath
										)
									}
								)
							})
					})


					thing.image = path.join('/', imageThumbnailPath)
					thing.rawImage = path.join('/things', imagePath)
					things.push(thing)

					if (things.length === numberOfThings)
						callback(null, things)
				})
			})
		})
	}


	loadThings(function (error, things) {

		if (error)
			throw new Error(error)
		
		callRenderer(response, things, view)
	})


	/*
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

	 // Use first picture matching a default name
	 // or otherwise a random one
	 images = files.filter(util.isImage)

	 images.some(function (imageName) {
	 mainImage = dir + '/' + imageName

	 return defaultNames.some(function (name) {

	 return imageName.search(name) !== -1
	 })
	 })
	 }
	 )
	 */


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
}
