var gm = require('gm'),
	cpus = require('os').cpus(),
	idleQueue = [],
	workers = []


function workOffQueue (worker, firstImage, callback) {

	convert(firstImage)

	function convert (image) {

		gm(image.absPath)
			.resize(200, 200, '>')
			.noProfile()
			.write(image.absThumbnailPath, function (error) {

				var nextImage

				if (error) {
					console.error(error)
					return
				}

				console.log('Created thumbnail for', image.absPath)

				nextImage = idleQueue.pop()

				if (nextImage) {
					worker.image = nextImage
					convert(nextImage)
				}
				else
					callback()
			})
	}
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

module.exports.addToQueue = function (image) {

	var positionInQueue = idleQueue
			.map(function (img) {
				return img.absPath
			})
			.indexOf(image.absPath),
		processingWorker = workers
			.map(function (worker) {
				return worker.image.absPath
			})
			.indexOf(image.absPath)


	if (positionInQueue > -1 || processingWorker > -1)
		return

	idleQueue.push(image)

	if (workers.length < cpus.length)
		addWorker()
}
