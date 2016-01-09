var fs = require('fs'),
	yaml = require('js-yaml')


module.exports = function (request, response) {

	var availableFields = {
		theme: ['light', 'dark'],
		owner: {}
	}

	response.render('profile', {
		page: 'profile',
		owner: global.config.owner,
		availableFields: availableFields
	})

}
