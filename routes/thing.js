var path = require('path'),
	fs = require('fs'),
	yaml = require('js-yaml'),
	isImage = require('is-image'),

	thingsPath = path.join(global.baseURL, 'things')


module.exports = function (request, response) {

	var requestedThingPath = path.join(thingsPath, request.params.id),
		files = fs.readdirSync(requestedThingPath),
		images = files.filter(isImage)

	function renderPage () {

		if (files.indexOf('index.yaml') === -1)
			response.render('thing', {
				page: 'thing',
				thing: {
					id: request.params.id,
					name: request
						.params
						.id
						.replace(/_/g, ' ')
						.replace(/-/g, ' - '),
					images: images
				}
			})

		else
			fs.readFile(
				path.join(requestedThingPath, 'index.yaml'),
				{encoding: 'utf-8'},
				function (error, fileContent) {

					var jsonData

					if (error) throw error

					jsonData = yaml.safeLoad(fileContent)
					jsonData.id = request.params.id
					jsonData.images = images

					response.render('thing', {
						page: 'thing',
						thing: jsonData
					})
				}
			)
	}


	//if (!createThumbnails(req.params.name, images))
	//	imagesPath = '/thumbs/sheetmusic'

	renderPage()
}
