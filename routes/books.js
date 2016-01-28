const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const fastmatter = require('fastmatter')
const objectAssign = require('object-assign')
const epubMetadata = require('epub-metadata')
const exif = require('exif2')
const JsZip = require('jszip')
const userHome = require('user-home')

global.basePath = global.basePath || userHome

const booksPath = path.join(global.basePath, 'books')


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

function getCoverImageUrl (book, baseURL) {

	var openlibraryBaseUrl = 'http://covers.openlibrary.org/b'

	if (!book) {
		return
	}
	else if (book.type === 'epub') {
		book.imageSource = baseURL + '/' + book.fileName + '/' + book.coverPath
	}
	else if (book.isbn) {
		book.imageSource = openlibraryBaseUrl + '/isbn/' + book.isbn + '-M.jpg'
	}
	else if (book.olid) {
		book.imageSource = openlibraryBaseUrl + '/olid/' + book.olid + '-M.jpg'
	}
	else {
		book.imageSource = ''
	}
}

function setDefaults (book) {
	book = book || {}
	book.author = book.author || ''
	book.title = book.title|| ''

	return book
}


module.exports.cover = function (request, response) {

	var imageFile = '',
		filePath = path.join(booksPath, request.params.book + '.epub'),
		epubFile

	fs.readFile(filePath, function (error, fileContent) {
		if (error)
			throw error

		epubFile = new JsZip(fileContent)
		imageFile = epubFile.file(request.params[0]).asNodeBuffer()

		fs.writeFileSync(
			'/Users/adrian/Desktop/test.jpg',
			imageFile
		)

		response.set('Content-Type', 'image/jpeg')
		response.send(imageFile)
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
						objectAssign(book, metadata)
						fulfill(book)
					})
			}
			else if (book.type === 'pdf') {
				exif(book.filePath, function (error, exifData) {
					objectAssign(book, exifData)
					fulfill(book)
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
						url: '/books/' + encodeURIComponent(baseName),
						fileName: book,
						filePath: path.join(booksPath, book)
					}
				})
		})
		.then(function (books) {
			return Promise.all(books.map(getAttributePromise))
		})
		.then(function (books) {
			books.forEach(
				(book) => getCoverImageUrl(book, req.app.locals.baseURL)
			)
			books = books
				.map(setDefaults)
				.sort(function (a, b) {
					return (a.title > b.title) ?
						1 :
						(a.title < b.title) ? -1 : 0
				})

			res.render('index', {
				page: 'Books',
				books: books
			})
		})
		.catch(function (error) {
			console.error(error.stack)
		})
}
