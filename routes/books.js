var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml'),

	util = require('../../../util')


function getFiles (directory) {
	return new Promise(function (fulfill, reject) {
		fs.readdir(directory, function (error, files) {
			if (error) {
				if (error.code === 'ENOENT')
					fulfill([])
				else
					reject(error)

				console.error(error)
			}
			else
				fulfill(files)
		})
	})
}


module.exports.one = function (req, res) {
	var bookId = req.params.book,
		book = {
			name: bookId,
			url: bookId + '.epub'
		}

	res.render('index', {
		page: 'Books',
		book: book
	})
}


module.exports.all = function (req, res) {

	getFiles(path.join(global.baseURL, 'books'))
		.then(function (files) {
			return files
				.filter(util.isBook)
				.map(function (book) {

					var name = book.replace(/\.\w+$/gi, '')

					return {
						name: name,
						url: '/books/' + name
					}
				})
		})
		.then(function (books) {
			res.render('index', {
				page: 'Books',
				books: books
			})
		})
}
