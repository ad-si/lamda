var fs = require('fs'),
	path = require('path'),
	url = require('url'),

	yaml = require('js-yaml'),
	gm = require('gm'),
	isImage = require('is-image'),

	imageResizer = require('image-resizer'),

	thingsDir = path.join(global.baseURL, 'things'),
	thumbsDirectory = path.join(global.projectURL, 'thumbs')


fs.mkdir(path.join(thumbsDirectory, 'things'), function (error) {

	if (error && error.code !== 'EEXIST')
		throw new Error(error)
})


function getCoverImage (images) {

	// Try to load one of the default images,
	// otherwise choose a random one

	var defaultNames,
		coverImage

	images = images || []
	defaultNames = [
			'overview',
			'front',
			'index',
			'top'
		]
	coverImage = images[0] || null


	defaultNames.some(function (name) {
		return images.some(function (image) {

			var baseName = path.basename(image, '.png')

			if (baseName === name) {
				coverImage = image
				return true
			}

			return false
		})
	})

	return coverImage
}


function callRenderer (res, things, view) {

	var fortune

	if (things) {
		fortune = things
			.map(function (element) {
				return element.price
			})
			.reduce(function (previous, current) {

				if (typeof previous === 'string')
					previous = Number(previous.slice(0, -1))

				previous = previous || 0


				if (typeof current === 'string')
					current = Number(current.slice(0, -1))

				current = current || 0


				return previous + current
			})
			.toFixed(2)
	}

	things = things || []

	res.render('index', {
		page: 'things',
		things: things.sort(function (a, b) {

			var dateA = (a.dateOfPurchase === 'Date') ? 0 : a.dateOfPurchase,
				dateB = (b.dateOfPurchase === 'Date') ? 0 : b.dateOfPurchase

			a = new Date(dateA || 0)
			b = new Date(dateB || 0)

			return b - a
		}),
		view: view,
		fortune: fortune
	})
}


module.exports = function (req, response) {

	var view = (req.query.view === 'wide') ? 'wide' : 'standard',
		things = []


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

							var numberOfFiles

							if (error || !files)
								return callback(error)

							numberOfFiles = files.length

							files.forEach(function (file) {

								function checkImagesLoadStatus () {
									if (images.length === numberOfFiles)
										callback(null, images, indexData)
								}

								if (file === 'index.yaml') {
									fs.readFile(
										path.join(thingsDir, thingDir, 'index.yaml'),
										{encoding: 'utf-8'},
										function (error, fileContent) {

											if (error) {
												console.error(error)
												return
											}

											numberOfFiles--

											indexData = yaml.safeLoad(fileContent)

											checkImagesLoadStatus()
										}
									)
								}
								else if (isImage(file))
									images.push(file)

								else
									numberOfFiles--


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

					var imagePath,
						imageThumbnailPath,
						coverImage = getCoverImage(images)

					if (error) {
						if (error.code === 'ENOTDIR') {
							numberOfThings--
							return
						}
						else {
							callback(error)
							return
						}
					}

					thing = indexData || thing

					thing.name = thingDir.replace(/_/g, ' ')


					if (coverImage) {
						imagePath = path.join(thingDir, coverImage)
						imageThumbnailPath = path.join(
							'thumbs',
							'things',
							imagePath
						)

						fs.exists(imageThumbnailPath, function (exists) {

							if (exists) return

							fs.mkdir(
								path.join(thumbsDirectory, 'things', thingDir),
								function (error) {

									if (error && error.code !== 'EEXIST') {
										console.error(error)
										return
									}

									//TODO before re-adding:
									// ImageResizer must allow to add several
									// callbacks or to add them lazily

									/*
									 imageResizer.addToQueue({
									 absPath: path.join(
									 thingsDir, imagePath
									 ),
									 absThumbnailPath: path.join(
									 global.projectURL, imageThumbnailPath
									 )
									 })
									 */
								}
							)

						})


						thing.image = url.format({
							pathname: '/things/' + imagePath,
							query: {
								width: 200,
								height: 200
							}
						})
						thing.rawImage = '/things/' + imagePath
					}

					thing.url = '/things/' + thingDir
					things.push(thing)

					if (things.length === numberOfThings)
						callback(null, things)
				})
			})
		})
	}


	loadThings(function (error, things) {

		if (error)
			console.error(error.stack)
		else
			callRenderer(response, things, view)
	})
}
