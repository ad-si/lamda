var fs = require('fs'),
	yaml = require('js-yaml')


module.exports = function (request, response) {

	console.log('test')

	var availableFields = {
		theme: ['light', 'dark'],
		baseURL: '',
		owner: {}
	}

	response.render('profile', {
		page: 'profile',
		owner: global.config.owner,
		availableFields: availableFields
	})

}
