var fs = require('fs'),
	path = require('path'),
	url = require('url'),
	util = require('util'),

	gm = require('gm')

module.exports = function (request, response, next) {

	var year = request.params.year,
		month = request.params.month,
		day = request.params.day,
		eventName = request.params.event,
		photoName = request.params.photo,

		imagePath = path.join(year, month, day, eventName, photoName),
		urlObject = url.parse(request.url, true),
		src = ['/photos', year, month,
			      util.format('%s-%s-%s_%s', year, month, day, eventName),
			      photoName
		      ].join('/') + '.' + urlObject.query.filetype

	/*gm(src)
		.identify(function (error, data) {
			if (error)
				console.log(error)

			console.log(data)
		})
		*/

	response.render('photo', {
		page: 'Photo',
		photo: {
			name: request.params.photo,
			src: src,
			exif: {}
		}
	})
}
