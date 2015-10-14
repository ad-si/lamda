var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml'),
	fastmatter = require('fastmatter'),
	objectAssign = require('object-assign'),
	epubMetadata = require('epub-metadata'),
	exif = require('exif2'),
	booksPath = path.join(global.baseURL, 'books')


function isBook (fileName) {
	return /.+\.(epub|pdf|md)$/gi.test(fileName)
}

function getFiles (directory) {
	return new Promise(function (fulfill, reject) {
		fs.readdir(directory, function (error, files) {
			if (error) {
				if (error.code === 'ENOENT')
					fulfill([])
				else
					reject(error)
			}
			else
				fulfill(files)
		})
	})
}

function getCoverImageUrl (book) {

	var baseUrl = 'http://covers.openlibrary.org/b/'

	if (!book) {
		return
	}
	if (book.isbn) {
		book.imageSource = baseUrl + 'isbn/' + book.isbn + '-M.jpg'
	}
	else if (book.olid) {
		book.imageSource = baseUrl + 'olid/' + book.olid + '-M.jpg'
	}
	else {
		book.imageSource = ''
	}
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
	catch (epubError) {

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

	res.render('index', {
		page: 'Books',
		book: book
	})
}


module.exports.all = function (req, res) {

	function getAttributePromise (book) {

		return new Promise(function (fulfill, reject) {

			if (book.type === 'md') {
				var bookStream = fs.createReadStream(book.filePath)

				bookStream.pipe(fastmatter.stream(function (attributes) {
					objectAssign(book, attributes)
					fulfill(book)
				}))

				bookStream.on('error', function (error) {
					reject(error)
				})
			}
			else if (book.type === 'epub') {
				epubMetadata(book.filePath)
					.then(function (metadata) {
						fulfill(metadata)
					})
			}
			else if (book.type === 'pdf') {
				exif(book.filePath, function (error, exifData) {
					console.log(
						require('util').inspect(exifData, {depth: null})
					)
					fulfill(exifData)
				})
			}
			else {
				fulfill(book)
			}
		})
	}

	getFiles(booksPath)
		.then(function (files) {
			return files
				.filter(isBook)
				.map(function (book) {

					var fileEnding = path.extname(book),
						baseName = path.basename(book, fileEnding)

					return {
						title: baseName,
						basename: baseName,
						type: fileEnding.substr(1),
						url: '/books/' + baseName,
						fileName: book,
						filePath: path.join(booksPath, book)
					}
				})
		})
		.then(function (books) {
			return Promise.all(books.map(getAttributePromise))
		})
		.then(function (books) {

			books.forEach(getCoverImageUrl)

			res.render('index', {
				page: 'Books',
				books: books
			})
		})
		.catch(function (error) {
			console.error(error.stack)
		})
}
