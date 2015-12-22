'use strict'

const fs = require('fs')
const path = require('path')

const getPieceImages = require('../modules/getPieceImages')


module.exports = function (songsPath, thumbsPath){

	return function (req, res) {

		let songId = req.params.name
		let files = fs.readdirSync(path.join(songsPath, songId))
		let images = getPieceImages(files, songId, songsPath, thumbsPath)

		res.render('raw', {
			page: 'raw',
			baseURL,
			song: {
				id: songId,
				images: images
			},
			style: req.query.style
		})
	}
}
