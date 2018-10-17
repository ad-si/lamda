'use strict'

const fs = require('fs')
const path = require('path')
const fastmatter = require('fastmatter')
const objectAssign = require('object-assign')
const epubMetadata = require('epub-metadata')
const exif = require('exif2')
const JsZip = require('jszip')


function isBook (fileName) {
  return /.+\.(epub|pdf|md)$/gi.test(fileName)
}

function getFiles (directory) {
  return new Promise((fulfill, reject) => {
    fs.readdir(directory, (error, files) => {
      if (error) {
        if (error.code === 'ENOENT') fulfill([])
        else reject(error)
      }
      else {
        fulfill(files)
      }
    })
  })
}

function getCoverImageUrl (book, baseURL) {
  const openlibraryBaseUrl = 'http://covers.openlibrary.org/b'

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
  book.title = book.title || ''

  return book
}


module.exports.cover = (request, response) => {
  const booksPath = path.join(request.app.locals.basePath, 'books')
  const filePath = path.join(booksPath, request.params.book + '.epub')
  let imageFile = ''
  let epubFile

  fs.readFile(filePath, (error, fileContent) => {
    if (error) throw error

    epubFile = new JsZip(fileContent)
    imageFile = epubFile
      .file(request.params[0])
      .asNodeBuffer()

    fs.writeFileSync(
      '/Users/adrian/Desktop/test.jpg',
      imageFile
    )

    response.set('Content-Type', 'image/jpeg')
    response.send(imageFile)
  })
}


module.exports.one = (request, response) => {
  const booksPath = path.join(request.app.locals.basePath, 'books')
  const bookId = request.params.book
  const book = {
    name: bookId,
    type: 'epub',
    stats: null,
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

  response.render('book', {
    page: 'Book',
    book: book,
  })
}


module.exports.all = (request, response) => {
  const booksPath = path.join(request.app.locals.basePath, 'books')

  function getAttributePromise (book) {
    return new Promise((fulfill, reject) => {

      if (book.type === 'md') {
        const bookStream = fs.createReadStream(book.filePath)

        bookStream.pipe(fastmatter.stream(attributes => {
          objectAssign(book, attributes)
          fulfill(book)
        }))

        bookStream.on('error', error => {
          reject(error)
        })
      }
      else if (book.type === 'epub') {
        epubMetadata(book.filePath)
          .then(metadata => {
            objectAssign(book, metadata)
            fulfill(book)
          })
      }
      else if (book.type === 'pdf') {
        exif(book.filePath, (error, exifData) => {
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
    .then(files => {
      return files
        .filter(isBook)
        .map(book => {
          const fileEnding = path.extname(book)
          const baseName = path.basename(book, fileEnding)

          return {
            title: baseName,
            basename: baseName,
            type: fileEnding.substr(1),
            url: request.app.locals.baseURL + '/' +
              encodeURIComponent(baseName),
            fileName: book,
            filePath: path.join(booksPath, book),
          }
        })
    })
    .then(books => Promise.all(books.map(getAttributePromise)))
    .then(books => {
      books.forEach(
        (book) => getCoverImageUrl(book, request.app.locals.baseURL)
      )
      books = books
        .map(setDefaults)
        .sort((itemA, itemB) => {
          return itemA.title > itemB.title
            ? 1
            : itemA.title < itemB.title
              ? -1
              : 0
        })

      response.render('books', {
        page: 'Books',
        books: books,
      })
    })
    .catch(error => {
      console.error(error.stack)
    })
}
