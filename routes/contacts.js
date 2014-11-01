var fs = require('fs'),
	yaml = require('js-yaml'),
	util = require('../../../util'),
	contactsPath = global.baseURL + '/contacts'


module.exports = function (req, res) {

	var contacts = [],
		files = fs.readdirSync(contactsPath),
		keysCollection = []


	files.forEach(function (file) {

		fs.readFile(contactsPath + '/' + file, {encoding: 'utf-8'}, function (error, fileContent) {

			if (error) throw error

			var jsonContactData = yaml.safeLoad(fileContent)

			util.writeKeys(keysCollection, jsonContactData)

			contacts.push(util.formatData(jsonContactData))


			if (contacts.length === files.length) {

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

		})
	})
}
