const fs = require('fs')
const path = require('path')
const util = require('util')

const yaml = require('js-yaml')

const utils = require('../modules/utils')

const events = {}


events.period = function (req, res, next) {

	const photosDirectory = path.join(req.app.locals.basePath, 'photos')

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
			.getEventsForMonth(
				year,
				month,
				photosDirectory,
				req.app.locals.baseURL
			)
			.then(function (monthObject) {
				monthObject.page = 'Photos'
				monthObject.year = year
				monthObject.yearUrl = req.app.locals.baseURL + '/' + year

				res.render('index', monthObject)
			})
			.catch(function (error) {
				console.error(error)
				next()
			})
	}
	else
		utils
			.getMonthsForYear(year, photosDirectory, req.app.locals.baseURL)
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

	const photosDirectory = path.join(req.app.locals.basePath, 'photos')
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
						req.app.locals.baseURL,
						year,
						month,
						day,
						eventName,
						photoName.replace(/\.(jpg|png)$/i, '') +
						'?filetype=' +
						path.extname(photoName).slice(1).toLowerCase()
					].join('/'),
					src: [
						req.app.locals.baseURL,
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
