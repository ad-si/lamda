var fs = require('fs'),
	path = require('path'),
	util = require('util'),

	filterMonths,
	filterDays


require('es6-promise').polyfill()


function getYear (date) {
	try {
		date = date.toISOString()
	}
	catch (error) {
	}
	return date.slice(0, 4)
}

function getMonth (date) {
	try {
		date = date.toISOString()
	}
	catch (error) {
	}
	return date.slice(5, 7)
}

function getDay (date) {
	try {
		date = date.toISOString()
	}
	catch (error) {
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

filterMonths = filterTwoDigitDirs
filterDays = filterTwoDigitDirs


function filterEvents (files) {
	return files.filter(function (file) {
		return /[0-9]{4}-[01][0-9]-[0-3][0-9]_.*/.test(file)
	})
}

function getFiles (directory) {
	return new Promise(function (fulfill, reject) {
		fs.readdir(directory, function (error, files) {
			if (error)
				if (error.code === 'ENOENT') {
					//console.error(error)
					fulfill([])
				}
				else
					reject(error)
			else
				fulfill(files)
		})
	})
}

function createPeriodObject (period, events) {

	console.log(period, events)

	var periodObject = {
		url: '/photos/' + period.replace('-', '/'),
		events: events.map(function (event) {

			var date = new Date(event.slice(0, 10)),
				name = event.slice(11)

			return {
				name: name.replace(/[-_]/g, ' '),
				date: date,
				url: util.format(
					'/photos/%s/%s/%s/%s',
					date.getFullYear(),
					getMonth(date),
					getDay(date),
					name
				)
			}
		})
	}

	if (period.length >= 4)
		periodObject.year = getYear(period)

	if (period.length >= 7)
		periodObject.month = getMonth(period)

	if (period.length >= 10)
		periodObject.day = getDay(period)

	return periodObject
}

function getEventsForMonth (year, month, photosDirectory) {

	var monthDirectory = path.join(photosDirectory, year, month)

	return getFiles(monthDirectory)
		.then(filterEvents)
		.then(function (events) {
			return createPeriodObject(year + '-' + month, events)
		})
}

function getMonthsForYear (year, photosDirectory) {

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
				return getEventsForMonth(year, month, photosDirectory)
			}))
		})
		.then(function(months){
			return {
				year: year,
				url: yearDirectory,
				months: months
			}
		})
}

module.exports = {
	getFiles: getFiles,
	getMonthsForYear: getMonthsForYear,
	getEventsForMonth: getEventsForMonth,
	filterYears: filterYears,
	filterMonths: filterMonths,
	filterDays: filterDays,
	filterEvents: filterEvents,
	createPeriodObject: createPeriodObject
}
