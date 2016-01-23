const fs = require('fs')
const path = require('path')

const yaml = require('js-yaml')
const userHome = require('user-home')

const formatContact = require('./formatContact')

global.basePath = global.basePath || userHome
const contactsPath = path.join(global.basePath, 'contacts')


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

						res.render('contacts', {
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
