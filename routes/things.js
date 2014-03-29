var fs = require('fs'),
	files = require('../api/files')


module.exports.files = function (req, callback) {

	var path = ''

	if(req.params)
		path = '/' + req.params[0]

	files(path, function (data) {
		callback(data)
	})
}
