var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml'),
	formatContact = require('./formatContact'),
	contactsPath = path.join(global.baseURL, 'contacts')


module.exports = function (req, res) {

	var contacts = [],
		files = fs.readdirSync(contactsPath),
		keysCollection = []


	files
		.filter(function(fileName){
			return /\.yaml$/i.test(fileName)
		})
		.forEach(function (file, index, contactFiles) {
			fs.readFile(
				path.join(contactsPath, file),
				{encoding: 'utf-8'},
				function (error, fileContent) {

					if (error)
						throw error

					var jsonContactData = yaml.safeLoad(fileContent)

					Object
					.keys(jsonContactData)
					.forEach(function (key) {
						keysCollection[key] = true
					})

					contacts.push(formatContact(jsonContactData))


					if (contacts.length === contactFiles.length) {

						res.render('index', {
							page: 'contacts',
							contacts: contacts.sort(function(previous, current){
								return previous.name > current.name
							}),
							availableKeys: Object.keys(keysCollection),
							sortedKeys: [
								'name',
								'nickname',
								'gender',
								'birthday',
								'email',
								'mobile',
								'website',
								'facebook',
								'address'
							]
						})
					}

				}
			)
		})
}
