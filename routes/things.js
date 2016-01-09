'use strict'

const fs = require('fs')
const path = require('path')
const url = require('url')

const fsp = require('fs-promise')
const yaml = require('js-yaml')
const gm = require('gm')
const isImage = require('is-image')

const imageResizer = require('image-resizer-middleware')

const thingsDir = path.join(global.basePath, 'things')
const thumbnailsDirectory = path.resolve(__dirname, '../public/thumbnails')


try {
	fs.mkdirSync(thumbnailsDirectory)
}
catch (error) {
	if (error && error.code !== 'EEXIST')
		throw error
}


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
					current = Number(
						current
							.slice(0, -1)
							.replace('~', '')
					)

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

	let view = (req.query.view === 'wide') ? 'wide' : 'standard'

	return fsp
		.readdir(thingsDir)
		.then(thingDirs => {
			return thingDirs
				.filter(thingDir => !thingDir.startsWith('.'))
				.map(function (thingDir) {
					let thing = {
						images: [],
						directory: thingDir,
					}
					let indexData = {}
					let absoluteThingDir = path.join(thingsDir, thingDir)

					return fsp
						.readdir(absoluteThingDir)
						.then(files => {
							thing.files = files
							return thing
						})
				})
		})
		.then(thingPromises => {
			return Promise.all(thingPromises)
		})
		.then(function (things) {

			return things.map(function (thing) {
				thing.images = thing.files.filter(isImage)

				if (thing.files.indexOf('index.yaml') > 0) {
					return fsp
						.readFile(
							path.join(thingsDir, thing.directory, 'index.yaml')
						)
						.then(fileContent => {
							let thingData = yaml.safeLoad(fileContent)
							return Object.assign(thing, thingData)
						})
				}
				else {
					return Promise.resolve(thing)
				}
			})
		})
		.then(thingPromises => {
			return Promise.all(thingPromises)
		})
		.then(things => {
			return things.map(thing => {
				let coverImage = getCoverImage(thing.images)

				if (coverImage)  {
					thing.imagePath = path.join(thing.directory, coverImage)
					thing.imageThumbnailPath = path.join(
						thumbnailsDirectory, thing.imagePath)
					thing.image = url.format({
						pathname: global.baseURL + '/' + thing.imagePath,
						query: {
							'max-width': 200,
							'max-height': 200,
						}
					})
					thing.rawImage = '/things/' + thing.imagePath
				}

				thing.name = thing.directory.replace(/_/g, ' ')
				thing.url = '/things/' + thing.directory

				return thing
			})
		})
		.then(things => {
			callRenderer(response, things, view)
		})
		.catch(error => {
			console.error(error.stack)
		})
}
