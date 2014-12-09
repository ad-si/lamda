var fs = require('fs'),
	gm = require('gm'),
	cpus = require('os').cpus(),
	path = require('path'),
	url = require('url'),
	mkdirp = require('mkdirp')

utils = require('../util.js'),

	idleQueue = [],
	workers = []


function workOffQueue (worker, firstImage, callback) {

	function afterWrite (error, image) {

		var nextImage

		if (error) {
			console.error(error)
			if (image.callback) image.callback(error)
			return
		}

		console.log('Created thumbnail for', image.absPath)

		if (typeof image.callback === 'function')
			image.callback(null, image.absThumbnailPath)

		nextImage = idleQueue.pop()

		if (nextImage) {
			worker.image = nextImage
			convert(nextImage)
		}
		else
			callback()
	}

	function convert (image) {

		var width = image.width || 200,
			height = image.height || 200,
			pathDirectories


		pathDirectories = image.absThumbnailPath.split('/');
		pathDirectories.pop()

		mkdirp(path.normalize(pathDirectories.join('/')), function (error) {
			if (error)
				console.error(error)

			// TODO: Handle when thumbnail already exists
			// TODO: Use streams to directly stream the response
			gm(image.absPath)
				.autoOrient()
				.resize(width, height, '>')
				.noProfile()
				.write(image.absThumbnailPath, function (error) {
					afterWrite(error, image)
				})
		})
	}

	convert(firstImage)
}


function addWorker () {

	var worker,
		currentImage = idleQueue.pop()


	if (currentImage) {

		worker = {
			id: new Date(),
			image: currentImage
		}

		workers.push(worker)

		workOffQueue(worker, currentImage, function () {
			workers.splice(workers.indexOf(worker), 1)
		})
	}

}

function addToQueue (image) {

	var positionInQueue,
		processingWorker

	positionInQueue = idleQueue
		.map(function (img) {
			return img.absPath
		})
		.indexOf(image.absPath)

	processingWorker = workers
		.map(function (worker) {
			return worker.image.absPath
		})
		.indexOf(image.absPath)


	if (positionInQueue != -1 || processingWorker != -1)
		return

	idleQueue.push(image)

	if (workers.length < cpus.length)
		addWorker()
}

module.exports.addToQueue = addToQueue

module.exports.middleware = function (app) {

	return function (request, response, next) {

		var stream,
			image,
			fileUrl = url.parse(request.url, true)


		// Skip middleware if request is not for an image
		// or not for a scaled image
		if (!utils.isImage(fileUrl.pathname) ||
		    (!fileUrl.query.width || !fileUrl.query.height)) {
			next()
			return
		}

		image = {
			absPath: path.join(global.baseURL, app, fileUrl.pathname),
			absThumbnailPath: path.join(
				global.projectURL, 'thumbs', app, fileUrl.pathname
			),
			callback: function (error, absThumbnailPath) {
				if (error) {
					next()
					return
				}

				fs
					.createReadStream(absThumbnailPath)
					.pipe(response)
			},
			// TODO: Really serve an image with the specified size
			width: fileUrl.query.width,
			height: fileUrl.query.height
		}


		stream = fs.createReadStream(image.absThumbnailPath)

		stream.on('error', function (error) {

			if (error.code === 'ENOENT')
				addToQueue(image)
			else {
				console.error(error)
				next()
			}
		})

		stream.pipe(response)
	}
}
