'use strict'

const path = require('path')
const fsp = require('fs-promise')
const yaml = require('js-yaml')
const Hour = require('hour').default
const yamlRegex = /\.ya?ml$/i

module.exports = (eventsPath) => {
	return fsp
		.readdir(eventsPath)
		.then(filePaths => {
			return filePaths.filter(filePath => yamlRegex.test(filePath))
		})
		.then(filteredPaths => {
			return filteredPaths.map(filePath => {
				let absoluteFilePath = path.join(eventsPath, filePath)
				return fsp
					.readFile(absoluteFilePath)
					.then(fileContent => {
						try {
							const jsonEvent = yaml.safeLoad(
								fileContent,
								{filename: filePath}
							)
							jsonEvent.time = new Hour(
								filePath.replace(yamlRegex, '')
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
		.catch(error => console.error(error.stack))
}
