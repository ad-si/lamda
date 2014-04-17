var fs = require('fs'),

	app = {}


app.index = function (request, response) {

	response.render('music', {
		page: 'music'
	})

}

module.exports = app
