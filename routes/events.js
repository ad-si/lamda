var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml'),

	util = require('util'),
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
				monthObject.year = year
				monthObject.yearUrl = '/photos/' + year

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

	var year = req.params.year,
		month = req.params.month,
		day = req.params.day,
		eventName = req.params.event


	utils
		.getImagesForEvent(year, month, day, eventName, photosDirectory)
		.then(utils.filterImages)
		.then(function (photos) {
			return photos.map(function (photoName) {


				return {
					name: photoName,
					url: [
						'/photos', year, month, day, eventName,
						photoName.replace(/\.(jpg|png)$/i, '') +
						'?filetype=' +
						path.extname(photoName).slice(1).toLowerCase()
					].join('/'),
					src: [
						'/photos',
						year,
						month,
						util.format('%s-%s-%s_%s', year, month, day, eventName),
						photoName
					].join('/')
				}
			})
		})
		.then(function (photos) {
			res.render('event', {
				page: 'Event',
				maxWidth: 300,
				maxHeight: 300,
				event: {
					year: year,
					month: month,
					day: day,
					name: eventName,
					photos: photos
				}
			})
		})


}

module.exports = events
