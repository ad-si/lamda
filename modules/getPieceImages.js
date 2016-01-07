'use strict'

const fs = require('fs')
const path = require('path')

const isImage = require('is-image')
const imageResizer = require('image-resizer-middleware')


function createThumbnail (songName, image, thumbsPath) {

	var songThumbsPath = path.join(thumbsPath, songName)

	if (!fs.existsSync(thumbsPath))
		fs.mkdirSync(thumbsPath)

	if (!fs.existsSync(songThumbsPath))
		fs.mkdirSync(songThumbsPath)

	imageResizer.addToQueue(image)

	return true
}


module.exports = function (files, songName, songsPath, thumbsPath) {

	return files
		.filter(isImage)
		.map(function (fileName) {
			const imageURL = `${global.baseURL}/${songName}/${fileName}`
			const maxWidth = 2000
			const maxHeight = 2000

			const image = {
				path: imageURL,
				thumbnailPath: imageURL +
					`?maximum-size=${maxWidth}x${maxHeight}`,
				absPath: path.join(songsPath, songName, fileName),
				absThumbnailPath: path.join(thumbsPath, songName, fileName)
			}

			createThumbnail(songName, image, thumbsPath)

			return image
		})
}
