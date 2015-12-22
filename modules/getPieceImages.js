const fs = require('fs')
const path = require('path')

const isImage = require('is-image')
const imageResizer = require('image-resizer')


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

			var imagePath = baseURL + '/' + songName + '/' + fileName,
				thumbnailPath = baseURL + '/thumbs' + imagePath,
				image = {
					path: imagePath,
					thumbnailPath: thumbnailPath,
					absPath: path.join(songsPath, songName, fileName),
					absThumbnailPath: path.join(thumbsPath, songName, fileName),
					maxWidth: 2000,
					maxHeight: 2000
				}

			createThumbnail(songName, image, thumbsPath)

			return image
		})
}
