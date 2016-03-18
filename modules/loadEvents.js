'use strict'

const path = require('path')
const fsp = require('fs-promise')
const yaml = require('js-yaml')
const Interval = require('@datatypes/interval').default
const momentFromString = require('@datatypes/moment').default

const yamlRegex = /\.ya?ml$/i


module.exports = (eventsPath, request) => {
	console.log(request.app.locals)

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
						const eventObject = yaml.safeLoad(
							fileContent,
							{filename: filePath}
						)
						const timeString = filePath.replace(yamlRegex, '')

						if (!timeString.includes('--')) {
							timeString = momentFromString(timeString)
								.intervalString
						}
						Object.assign(eventObject, {
							interval: new Interval(timeString),
							fileName: filePath,
							singleViewURL: request.app.locals.runsStandalone ?
								'/' + filePath :
								'/files/Events/' + filePath,
							baseName: timeString,
							title: eventObject.title ?
							 	eventObject.title :
								(eventObject.type ?
									(eventObject.type.slice(0,1).toUpperCase() +
							 		eventObject.type.slice(1)) :
									JSON.stringify(eventObject)
								),
						})

						return eventObject
					}
					catch (error) {
						console.error(error.stack)
					}
				})
		}))
		.then(filePromises => Promise.all(filePromises))
		.catch(error => console.error(error.stack))
}
