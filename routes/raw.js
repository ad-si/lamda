'use strict'

const fs = require('fs')
const path = require('path')

const getPieceImages = require('../modules/getPieceImages')


module.exports = function (songsPath, thumbsPath){

	return function (req, res) {

		const songId = req.params.name
		const files = fs.readdirSync(path.join(songsPath, songId))
		const images = getPieceImages(files, songId, songsPath, thumbsPath)

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
