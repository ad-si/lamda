var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml'),

	utils = require('../modules/utils'),

	events = {},
	photosDirectory = path.join(global.baseURL, 'photos')


require('es6-promise').polyfill()


events.period = function (req, res, next) {

	var year = req.params.year,
		yearDir = path.join(photosDirectory, year),
		month = req.params.month,
		monthDir = month ? path.join(photosDirectory, month) : null,
		day = req.params.day,
		dayDir = day ? path.join(photosDirectory, day) : null


	if (day) {
		//TODO
	}
	else if (month) {
		utils
			.getEventsForMonth(year, month, photosDirectory)
			.then(function (monthObject) {
				monthObject.page = 'Photos'
				res.render('index', monthObject)
			})
			.catch(function (error) {
				console.error(error)
				next()
			})
	}
	else
		utils
			.getMonthsForYear(year, photosDirectory)
			.then(function (yearObject) {

				res.render('index', {
					page: 'Photos',
					years: [yearObject]
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
