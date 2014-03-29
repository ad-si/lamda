var fs = require('fs'),
	files = require('../api/files'),
	events = require('../api/events')


module.exports.files = function (req, callback) {

	var path = ''

	if(req.params)
		path = '/' + req.params[0]

	files(path, function (data) {
		callback(data)
	})
}


module.exports.events = function (req, res) {

	var path = ''

	if(req.params)
		path = '/' + req.params[0]

	//console.log(events())

	res.send(events())
}
