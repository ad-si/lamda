'use strict'

const path = require('path')
const fsp = require('fs-promise')
const yaml = require('js-yaml')
const Interval = require('@datatypes/interval').default
const momentFromString = require('@datatypes/moment').default

const yamlRegex = /\.ya?ml$/i


module.exports = (eventsPath) => {
	return fsp
		.readdir(eventsPath)
		.then(filePaths =>
			filePaths.filter(filePath => yamlRegex.test(filePath))
		)
		.then(filteredPaths => filteredPaths.map(filePath => {

			let absoluteFilePath = path.join(eventsPath, filePath)

			return fsp
				.readFile(absoluteFilePath)
				.then(fileContent => {
					try {
						const jsonEvent = yaml.safeLoad(
							fileContent,
							{filename: filePath}
						)
						const timeString = filePath.replace(yamlRegex, '')

						if (!timeString.includes('--')) {
							timeString = momentFromString(timeString)
								.intervalString
						}
						jsonEvent.interval = new Interval(timeString)

						return jsonEvent
					}
					catch (error) {
						console.error(error.stack)
					}
				})
		}))
		.then(filePromises => Promise.all(filePromises))
		.catch(error => console.error(error.stack))
}
