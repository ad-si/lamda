var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml'),

	events = {},
	photosDir = path.join(global.baseURL, 'photos')


require('es6-promise').polyfill()


events.year = function (req, res, next) {

	var yearDir = path.join(photosDir, req.params.year)

	res.render('year', {
		page: 'Year'
	})
}

events.month = function (req, res, next) {

	res.render('month', {
		page: 'Month'
	})
}


events.day = function (req, res, next) {

	res.render('day', {
		page: 'Day'
	})
}


events.event = function (req, res, next) {

	res.render('event', {
		page: 'Event'
	})
}

module.exports = events
