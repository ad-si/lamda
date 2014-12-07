var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml'),

	utils = require('../modules/utils'),

	photosDir = path.join(global.baseURL, 'photos')


require('es6-promise').polyfill()


module.exports = function (req, res, next) {

	utils
		.getFiles(photosDir)
		.then(utils.filterYears)
		.then(function (years) {
			return Promise.all(years.map(function(year){
				return utils.getMonthsForYear(year, photosDir)
			}))
		})
		.then(function (years) {

			console.log(years)

			res.render('index', {
				page: 'Photos',
				years: years || []
			})
		})
		.catch(function (error) {
			console.error(error)
			next()
		})
}
