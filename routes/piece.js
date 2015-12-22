'use strict'

const fs = require('fs')
const path = require('path')

const yaml = require('js-yaml')

const getPieceImages = require('../modules/getPieceImages')

let baseURL = ''


function getLilypondFilesObjects (files, songName) {

	return files
		.filter(function(file){
			return file.endsWith('.ly')
		})
		.map(function (fileName) {

			var filePath = '/sheetmusic/' + songName + '/' + fileName,
				lilypondObject = {
					path: filePath,
					absPath: path.join(songsPath, songName, fileName)
				}

			return lilypondObject
		})
}


module.exports = function (songsPath, thumbsPath) {

	return function (req, res) {

		var songId = req.params.name,
			requestedSongPath = path.join(songsPath, songId),
			files = fs.readdirSync(requestedSongPath),
			images = getPieceImages(files, songId, songsPath, thumbsPath),
			lilypondFiles = getLilypondFilesObjects(files, songId),
			renderObject = {
				page: 'sheetmusic',
				baseURL
			}


		if (files.indexOf('index.yaml') === -1)
			res.render('index', Object.assign(
				renderObject,
				{
					song: {
						id: songId,
						name: songId.replace(/_/g, ' ').replace(/-/g, ' - '),
						images: images,
						lilypondFiles: lilypondFiles
					}
				}
			))

		else
			fs.readFile(
				path.join(requestedSongPath, 'index.yaml'),
				{encoding: 'utf-8'},
				function (error, fileContent) {

					if (error) throw error

					var jsonData = yaml.safeLoad(fileContent)

					jsonData.id = req.params.name
					jsonData.images = images
					jsonData.lilypondFiles = lilypondFiles

					res.render('index', Object.assign(
						renderObject,
						{
							page: 'sheetmusic',
							baseURL,
							song: jsonData
						}
					))
				}
			)
	}
}
