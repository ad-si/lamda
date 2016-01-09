'use strict'

const fs = require('fs')
const path = require('path')

const yaml = require('js-yaml')

const getPieceImages = require('../modules/getPieceImages')


function getLilypondFilesObjects (files, songName) {

	return files
		.filter(function(file){
			return file.endsWith('.ly')
		})
		.map(function (fileName) {

			const filePath = '/sheetmusic/' + songName + '/' + fileName
			const lilypondObject = {
				path: filePath,
				absPath: path.join(songsPath, songName, fileName)
			}

			return lilypondObject
		})
}


module.exports = function (songsPath, thumbsPath, baseURL) {

	return function (req, res) {

		const songId = req.params.name
		const requestedSongPath = path.join(songsPath, songId)
		const files = fs.readdirSync(requestedSongPath)
		const images = getPieceImages(
			files, songId, songsPath, thumbsPath, baseURL
		)
		const lilypondFiles = getLilypondFilesObjects(files, songId)
		const renderObject = {
			page: 'sheetmusic',
			baseURL,
			song: {
				id: songId,
				name: songId.replace(/_/g, ' ').replace(/-/g, ' - '),
				images: images,
				lilypondFiles: lilypondFiles
			}
		}


		if (files.indexOf('index.yaml') === -1)
			res.render('piece', renderObject)

		else
			fs.readFile(
				path.join(requestedSongPath, 'index.yaml'),
				'utf-8',
				function (error, fileContent) {

					if (error) throw error

					renderObject.song = Object.assign(
						renderObject.song,
						yaml.safeLoad(fileContent)
					)

					res.render('piece',renderObject)
				}
			)
	}
}
