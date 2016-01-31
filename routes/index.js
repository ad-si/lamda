const fs = require('fs')
const path = require('path')

const yaml = require('js-yaml')

const utils = require('../modules/utils')


module.exports = function (req, res, next) {

	const photosDir = path.join(req.app.locals.basePath, 'photos')

	utils
		.getFiles(photosDir)
		.then(utils.filterYears)
		.then(years => Promise.all(
			years.map(year =>
				utils.getMonthsForYear(year, photosDir, req.app.locals.baseURL))
		))
		.then(years => {
			res.render('index', {
				page: 'Photos',
				years: years || []
			})
		})
		.catch(next)
}
