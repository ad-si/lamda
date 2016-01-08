'use strict'

const fs = require('fs')
const path = require('path')

const yaml = require('js-yaml')
const imageResizer = require('image-resizer-middleware')
const isImage = require('is-image')
const userHome = require('user-home')

const baseURL = ''


module.exports = function (songsPath, thumbsPath) {

	return function (req, res) {

		var songs = [],
			songDirs = fs.readdirSync(songsPath),
			numberOfDirectories = songDirs.length


		songDirs.forEach(function (songDir, index) {

			var dirPath = path.join(songsPath, songDir),
				files,
				images


			if (fs.lstatSync(dirPath).isDirectory() && songDir[0] !== '.')
				files = fs.readdirSync(dirPath)

			else {
				numberOfDirectories--
				return
			}

			images = files
				.filter(isImage)
				.map(function (fileName) {
					return path.join(songDir, fileName)
				})


			function renderPage () {

				songs.push({
					id: songDir,
					images: images
				})

				if (songs.length === numberOfDirectories)
					res.render('pieces', {
						page: 'sheetmusic',
						songs: songs
					})
			}

			renderPage()
		})
	}
}
