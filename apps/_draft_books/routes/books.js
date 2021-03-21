import fs from 'fs'
import path from 'path'
import url from 'url'

import fastmatter from 'fastmatter'
import objectAssign from 'object-assign'
import epubMetadata from 'epub-metadata'
import { exiftool } from 'exiftool-vendored'
import JsZip from 'jszip'


function isBook (dirEnt) {
  return dirEnt &&
    (
      (dirEnt.isDirectory() && !/\.git$/gi.test(dirEnt.name)) ||
      /\.(epub|pdf|md)$/gi.test(dirEnt.name)
    )
}


function getDirEnts (directory) {
  return new Promise((fulfill, reject) => {
    fs.readdir(directory, {withFileTypes: true}, (error, files) => {
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
  const openlibraryBaseUrl = 'https://covers.openlibrary.org/b'

  if (!book) {
    return
  }
  else if (book.type === 'epub') {
    return book.coverPath
      ? `${baseURL}/${book.fileName}/${book.coverPath}`
      : ''
  }
  else if (book.isbn) {
    return openlibraryBaseUrl + '/isbn/' + book.isbn + '-M.jpg'
  }
  else if (book.olid) {
    return openlibraryBaseUrl + '/olid/' + book.olid + '-M.jpg'
  }
  else if (book.type === 'pdf') {
    return url.format({
      pathname: `${baseURL}/${book.fileName}.jpg`,
      query: {
        'max-width': 200,
        'max-height': 200,
      },
    })
  }
  else {
    return ''
  }
}


function setDefaults (book) {
  book = book || {}
  book.author = book.author || ''
  book.title = book.title || ''

  return book
}


function getAttributePromise (book) {
  if (!book || typeof book !== 'object') {
    throw new Error('A valid book object must be specified')
  }

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
        .catch(error => {
          reject(error)
        })
    }
    else if (book.type === 'pdf') {
      exiftool
        .read(book.filePath)
        .then(exifData => {
          objectAssign(book, exifData)
          fulfill(book)
        })
        .catch(error => {
          reject(error)
        })
    }
    else {
      fulfill(book)
    }
  })
}


export async function cover (request, response) {
  const booksPath = request.app.locals.basePath
  const filePath = path.join(booksPath, request.params.book + '.epub')
  let epubFile

  fs.readFile(filePath, async (error, fileContent) => {
    if (error) throw error

    try {
      const zip = new JsZip()
      epubFile = await zip.loadAsync(fileContent)
      const imageFile = await epubFile
        .file(request.params[0])
        .async('nodebuffer')

      if (!imageFile) {
        response.send()
        return
      }

      // fs.writeFileSync(
      //   '/Users/adrian/Desktop/test.jpg',
      //   imageFile
      // )

      response.set('Content-Type', 'image/jpeg')
      response.send(imageFile)
    }
    catch (unzipError) {
      console.error(unzipError)
    }
  })
}


export async function one (request, response) {
  const booksPath = request.app.locals.basePath
  const bookId = request.params.book
  const book = {
    name: bookId,
    type: 'epub',
    stats: {},
  }

  book.url = bookId + '.' + book.type
  book.path = path.join(booksPath, book.url)

  try {
    book.stats = await fs.promises.stat(book.path)
  }
  catch (epubError) {
    try {
      book.type = 'pdf'
      book.url = book.url.replace(/epub$/, book.type)
      book.path = book.path.replace(/epub$/, book.type)
      book.stats = await fs.promises.stat(book.path)
    }
    catch (pdfError) {
      try {
        book.type = 'md'
        book.url = book.url.replace(/pdf$/, book.type)
        book.path = book.path.replace(/pdf$/, book.type)
        book.stats = await fs.promises.stat(book.path)
        book.content = await fs.promises
          .readFile(book.path, {encoding: 'utf-8'})
      }
      catch (mdError) {
        try {
          book.type = 'directory'
          book.url = book.url.replace(/\.md$/, '')
          book.path = book.path.replace(/\.md$/, '')
          book.stats = await fs.promises.stat(book.path)
          const yamlFile = path.join(book.path, 'main.yaml')
          book.content = await fs.promises
            .readFile(yamlFile, {encoding: 'utf-8'})
        }
        catch (error) {
          console.error(error)
          delete book.type
        }
      }
    }
  }

  response.render('book', {
    page: 'Book',
    book,
  })
}


export async function all (request, response) {
  if (request.app.locals.lamda.filePaths.length !== 1) {
    throw new Error('Books currently supports only exactly one file path')
  }
  const booksPath = request.app.locals.lamda.filePaths[0]

  const dirEnts = await getDirEnts(booksPath)
  const booksPromises = dirEnts
    .filter(isBook)
    .map(bookEntry => {
      const bookName = bookEntry.name
      const fileEnding = path.extname(bookName)
      const baseName = path.basename(bookName, fileEnding)
      const book = {
        title: baseName,
        basename: baseName,
        type: fileEnding.substr(1),
        url: request.app.locals.baseURL + '/' +
          encodeURIComponent(baseName),
        fileName: bookName,
        filePath: path.join(booksPath, bookName),
      }
      return book
    })
    .map(getAttributePromise)

  const books = await Promise.all(booksPromises)

  // Add image sources
  books.forEach(book => {
    book.imageSource = getCoverImageUrl(book, request.app.locals.baseURL)
  })

  const booksSorted = books
    .map(setDefaults)
    .sort((itemA, itemB) => {
      // Latest book first
      return itemA.fileName < itemB.fileName
        ? 1
        : itemA.fileName > itemB.fileName
          ? -1
          : 0
    })


  response.render('books', {
    page: 'Books',
    books: booksSorted,
  })
}
