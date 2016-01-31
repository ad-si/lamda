var fs = require('fs'),
	path = require('path'),
	util = require('util'),
	isImage = require('is-image'),

	filterMonths = filterTwoDigitDirs,
	filterDays = filterTwoDigitDirs


function getYear (date) {
	try {
		date = date.toISOString()
	}
	catch (error) {
		console.error(error.stack)
	}
	return date.slice(0, 4)
}

function getMonth (date) {
	try {
		date = date.toISOString()
	}
	catch (error) {
		console.error(error.stack)
	}
	return date.slice(5, 7)
}

function getDay (date) {
	try {
		date = date.toISOString()
	}
	catch (error) {
		console.error(error.stack)
	}
	return date.slice(8, 10)
}

function filterTwoDigitDirs (list) {
	return list.filter(function (file) {
		return /^[0-9]{2}$/.test(file)
	})
}

function filterYears (list) {
	return list.filter(function (file) {
		return /^[0-9]{4}$/.test(file)
	})
}

function filterImages (list) {
	return list.filter(helper.isImage)
}

function filterEvents (files) {
	return files.filter(function (file) {
		return /([0-9]{4}-)?([01][0-9]-)?[0-3][0-9]_.*/.test(file)
	})
}

function getFiles (directory) {
	return new Promise(function (fulfill, reject) {
		fs.readdir(directory, function (error, files) {
			if (error) {
				if (error.code === 'ENOENT')
					fulfill([])
				else
					reject(error)
			}
			else
				fulfill(files)
		})
	})
}

function createPeriodObject (year, month, events, baseURL) {

	const periodObject = {
		year: year,
		month: month,
		url: baseURL + '/' + year + '/' + month,
		events: events.map(event => {
			const dateString = event.split('_', 1)[0]
			const name = event
				.split('_')
				.slice(1)
				.join('_')
			const day = dateString.split('-').pop()
			const date = new Date(`${year}-${month}-${day}`)

			return {
				name: name.replace(/[-_]/g, ' '),
				date: date instanceof Date && isFinite(date) ?
					date.toISOString().slice(0, 10) :
					null,
				url: [
					baseURL,
					date.getFullYear(),
					getMonth(date),
					getDay(date),
					name
				].join('/')
			}
		})
	}

	return periodObject
}

function getEventDirectory (year, month, day, eventName, photosDirectory) {

	eventName = util.format('%s-%s-%s_%s', year, month, day, eventName)

	return path.join(photosDirectory, year, month, eventName)
}

function getImagesForEvent (year, month, day, eventName, photosDirectory) {
	return getFiles(
		getEventDirectory(year, month, day, eventName, photosDirectory)
	)
}

function getEventsForMonth (year, month, photosDirectory, baseURL) {

	var monthDirectory = path.join(photosDirectory, year, month)

	return getFiles(monthDirectory)
		.then(filterEvents)
		.then(events => {
			return createPeriodObject(year, month, events, baseURL)
		})
		.catch(error => console.error(error.stack))
}

function getMonthsForYear (year, photosDirectory, baseURL) {

	var yearDirectory = path.join(photosDirectory, year)

	return getFiles(yearDirectory)
		.then(function (files) {
			// Find unique available months from directory and event names
			return filterMonths(files)
				.concat(filterEvents(files)
					.map(function (file) {
						return file.slice(5, 7)
					}))
				.filter(function (element, index, array) {
					return array.indexOf(element) === index
				})
		})
		.then(function (months) {
			return Promise.all(months.map(function (month) {
				return getEventsForMonth(year, month, photosDirectory, baseURL)
			}))
		})
		.then(function (months) {
			return {
				year: year,
				url: baseURL + '/' + year,
				months: months
			}
		})
		.catch(error => console.error(error.stack))
}


module.exports = {
	getFiles: getFiles,
	getEventDirectory: getEventDirectory,
	getImagesForEvent: getImagesForEvent,
	getMonthsForYear: getMonthsForYear,
	getEventsForMonth: getEventsForMonth,
	filterYears: filterYears,
	filterMonths: filterMonths,
	filterDays: filterDays,
	filterEvents: filterEvents,
	filterImages: filterImages,
	createPeriodObject: createPeriodObject
}
