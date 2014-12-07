var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml'),

	utils = require('../modules/utils'),

	events = {},
	photosDir = path.join(global.baseURL, 'photos')


require('es6-promise').polyfill()


events.period = function (req, res, next) {

	var year = req.params.year,
		yearDir = path.join(photosDir, year),
		month = req.params.month,
		monthDir = month ? path.join(photosDir, month) : null,
		day = req.params.day || '',
		dayDir = day ? path.join(photosDir, day) : null


	utils
		.getFiles(yearDir)
		.then(utils.filterMonths)
		.then()
		.then(utils.filterEvents)
		.then(function (events) {
			return [utils.createYearObject(year, events)]
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


events.event = function (req, res, next) {

	res.render('event', {
		page: 'Event'
	})
}

module.exports = events
