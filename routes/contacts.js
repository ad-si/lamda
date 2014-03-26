var fs = require('fs'),
	yaml = require('js-yaml'),
	util = require('../util'),

	path = './home/contacts'


module.exports = function (req, res) {

	var contacts = [],
		files = fs.readdirSync(path),
		keys = {}


	files.forEach(function (file) {

		fs.readFile(path + '/' + file, {encoding: 'utf-8'}, function (error, fileContent) {

			if (error) throw error

			var jsonContactData = yaml.safeLoad(fileContent)

			util.writeAvailableKeys(keys, jsonContactData)

			contacts.push(util.formatAddress(jsonContactData))


			if (contacts.length === files.length) {

				res.render('contacts', {
					page: 'contacts',
					contacts: contacts,
					keys: Object.keys(keys),
					sortedKeys: [
						'name',
						'nickname',
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
