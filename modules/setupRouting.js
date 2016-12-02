const path = require('path')

const express = require('express')
const stylus = require('stylus')

const books = require('../routes/books')


module.exports = (app) => {
  const isDevMode = app.get('env') === 'development'
  const projectDirectory = path.resolve(__dirname, '..')
  const publicDirectory = path.join(projectDirectory, 'public')
  const viewsDirectory = path.join(projectDirectory, 'views')
  const linkedModulesDirectory = path.join(projectDirectory, 'linked_modules')
  const booksDirectory = path.join(app.locals.basePath, 'books')
  const stylesDirectory = path.join(publicDirectory, 'styles')

  app.use(stylus.middleware({
    src: stylesDirectory,
    debug: isDevMode,
    compress: !isDevMode,
  }))
  app.use(express.static(publicDirectory))
  app.use(express.static(booksDirectory))
  app.use('/linked_modules', express.static(linkedModulesDirectory))

  app.set('views', viewsDirectory)

  app.get('/', books.all)
  app.get('/:book', books.one)
  app.get('/:book.epub/*', books.cover)
}
