var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml'),

	photosDir = path.join(global.baseURL, 'photos')


require('es6-promise').polyfill()


function getFiles (path) {
	return new Promise(function (fulfill, reject) {
		fs.readdir(path, function (error, files) {
			if (error)
				reject(error)
			else
				fulfill(files)
		})
	})
}

function filterYears (list) {
	return list.filter(function (file) {
		return /^[0-9]{4}$/.test(file)
	})
}

function getEventsForYear (year) {
	return getFiles(path.join(photosDir, year))
		.then(function (files) {
			return files.filter(function (file) {
				return /[0-9]{4}-[01][0-9]-[0-3][0-9]_.*/.test(file)
			})
		})
		.then(function (events) {
			return {
				year: Number(year),
				events: events.map(function (event) {
					return {
						name: event.slice(11).replace(/[-_]/g, ' '),
						date: event.slice(0, 10),
						url: '/photos/events/' + event
					}
				})
			}
		})
}


module.exports = function (req, res, next) {

	getFiles(photosDir)
		.then(filterYears)
		.then(function (years) {
			return Promise.all(years.map(getEventsForYear))
		})
		.then(function (yearObjects) {
			res.render('index', {
				page: 'Photos',
				years: yearObjects || []
			})
		})
		.catch(function (error) {
			console.error(error)
			next()
		})
}
