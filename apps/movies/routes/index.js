const fs = require('fs')
const path = require('path')
const betterPath = require('better-path')

function isMovie (fileName) {
  return fileName.search(/.+\.(webm|mp4|m4v|mkv)$/gi) !== -1
}

module.exports = (request, response) => {
  const movies = []
  const moviesPath = path.join(request.app.locals.basePath, 'movies')
  const rootEntries = fs.readdirSync(moviesPath)
  // eslint-disable-next-line no-unused-vars
  let numberOfRootEntries = rootEntries.length

  rootEntries.forEach(entry => {
    const absoluteEntryPath = path.join(
      request.app.locals.basePath,
      'movies',
      entry
    )
    let movieObjects = []

    const isDirectory = fs
      .lstatSync(absoluteEntryPath)
      .isDirectory()

    if (isDirectory) {
      movieObjects = fs.readdirSync(absoluteEntryPath)
        .filter(isMovie)
        .map(fileName => {
          return {
            title: betterPath(fileName)
              .baseName(),
            absolutePath: path.join(absoluteEntryPath, fileName),
            link: entry + '/' + fileName,
            type: 'video/x-matroska',
          }
        })
    }
    else if (isMovie(entry)) {
      movieObjects = [{
        title: betterPath(entry)
          .baseName(),
        absolutePath: absoluteEntryPath,
        link: entry,
      }]
    }
    else {
      numberOfRootEntries--
      return
    }

    movieObjects.forEach(movieObject => {
      movies.push(movieObject)
    })
  })

  response.render('index', {
    page: 'Movies',
    movies: movies.sort((movieA, movieB) => {
      if (movieA.title.toLowerCase() > movieB.title.toLowerCase()) {
        return 1
      }
      else if (movieA.title.toLowerCase() < movieB.title.toLowerCase()) {
        return -1
      }
      return 0
    }),
  })
}
