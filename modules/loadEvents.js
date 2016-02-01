'use strict'

let path = require('path')
let fsp = require('fs-promise')
let yaml = require('js-yaml')
let Hour = require('hour').default

module.exports = function (eventsPath) {
	return fsp
		.readdir(eventsPath)
		.then(filePaths => {
			return filePaths.filter(filePath => /.*\.ya?ml$/i.test(filePath))
		})
		.then(filteredPaths => {
			return filteredPaths.map(filePath => {
				let absoluteFilePath = path.join(eventsPath, filePath)
				return fsp
					.readFile(absoluteFilePath)
					.then(fileContent => {
						try {
							const jsonEvent = yaml.safeLoad(fileContent, {
								filename: filePath
							})
							jsonEvent.time = new Hour(
								filePath.replace(/\.ya?ml$/i, '')
							)
							return jsonEvent
						}
						catch (error) {
							console.error(error.stack)
						}
					})
			})
		})
		.then(filePromises => {
			return Promise.all(filePromises)
		})
}
