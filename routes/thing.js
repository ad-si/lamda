var path = require('path'),
	fs = require('fs'),
	yaml = require('js-yaml'),
	thingsPath = path.join(global.baseURL, 'things')


module.exports = function (request, response) {

	var requestedThingPath = path.join(thingsPath, request.params.id),
		files = fs.readdirSync(requestedThingPath)

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
						.replace(/-/g, ' - ')
					// TODO: Show images in single view
					//images: images.map(function (imgPath) {
					//	return path.join(imagesPath + imgPath)
					//})
				}
			})

		else
			fs.readFile(
				path.join(requestedThingPath, 'index.yaml'),
				{encoding: 'utf-8'},
				function (error, fileContent) {

					if (error) throw error

					var jsonData = yaml.safeLoad(fileContent)
					jsonData.id = request.params.id
					//jsonData.images = images

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
