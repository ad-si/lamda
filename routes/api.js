var fs = require('fs'),
	files = require('../api/files'),
	events = require('../api/events'),
	music = require('../api/music')


module.exports.files = function (request, callback) {

	var path = ''

	if(request.params)
		path = '/' + request.params[0]

	files(path, function (data) {
		callback(data)
	})
}

module.exports.events = function (request, response) {

	var path = ''

	if(request.params)
		path = '/' + request.params[0]

	//console.log(events())

	response.send(events())
}

module.exports.music = {
	song: function (request, response, callback) {

		var path = ''

		//console.log(JSON.stringify(request, null, 2))
		//console.log(request)

		//response.send(music())

		music(request, response, function (data) {
			response.send(data)
		})

		//if(request.params)
		//	path = '/' + req.params[0]

		//files(path, function (data) {
		//	callback(data)
		//})
	},
	songs: function(){},
	artist: function(){},
	artists: function(){}
}
