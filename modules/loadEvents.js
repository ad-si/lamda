'use strict'

let path = require('path')
let fsp = require('fs-promise')
let yaml = require('js-yaml')
let Hour = require('hour').default

module.exports = function (eventsPath) {
	return fsp
		.readdir(eventsPath)
		.then(filePaths => {
			return Promise.all(filePaths
				.filter(filePath => /.*\.ya?ml$/i.test(filePath))
				.map(filePath => {
					let absoluteFilePath = path.join(eventsPath, filePath)
					return fsp
						.readFile(absoluteFilePath)
						.then(fileContent => {
							let jsonEvent = yaml.safeLoad(fileContent)
							jsonEvent.time = new Hour(
								filePath.replace(/\.ya?ml$/i, '')
							)
							return jsonEvent
						})
				})
			)
		})
}
