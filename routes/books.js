var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml'),
	booksPath = path.join(global.baseURL, 'books')


function isBook (fileName) {
	return fileName.search(/.+\.(epub|pdf)$/gi) !== -1
}

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
			type: 'epub',
			stats: null
		}

	book.url = bookId + '.' + book.type
	book.path = path.join(booksPath, book.url)

	try {
		book.stats = fs.statSync(book.path)
	}
	catch (epubError){

		try {
			book.type = 'pdf'
			book.url = book.url.replace('epub', book.type)
			book.path = book.path.replace('epub', book.type)
			book.stats = fs.statSync(book.path)
		}
		catch (pdfError) {
			console.error(pdfError.stack)
		}
	}

	console.log(book);

	res.render('index', {
		page: 'Books',
		book: book
	})
}


module.exports.all = function (req, res) {

	getFiles(booksPath)
		.then(function (files) {
			return files
				.filter(isBook)
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
		.catch(function(error){
			console.error(error.stack)
		})
}
