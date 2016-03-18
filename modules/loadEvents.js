'use strict'

const path = require('path')
const fsp = require('fs-promise')
const yaml = require('js-yaml')
const Interval = require('@datatypes/interval').default
const momentFromString = require('@datatypes/moment').default

const yamlRegex = /\.ya?ml$/i


module.exports = (eventsPath, request) => {
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
					const eventObject = yaml.safeLoad(
						fileContent,
						{filename: filePath}
					)
					const timeString = filePath.replace(yamlRegex, '')
					const interval = new Interval(timeString)

					if (!timeString.includes('--')) {
						timeString = momentFromString(timeString)
							.intervalString
					}

					Object.assign(eventObject, {
						interval,
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
						tooltipText:
							// TODO: Print human readable duration
							`Duration: ${interval.duration}\n` +
							(`${interval.start.string.substr(0, 16)} to\n` +
							interval.end.string.substr(0, 16))
								.replace(/T/g, ' ')
					})

					return eventObject
				})
				.catch(error => {
					console.error(error.stack)
					return null
				})
		}))
		.then(filePromises => Promise.all(filePromises))
		.catch(error => console.error(error.stack))
}
