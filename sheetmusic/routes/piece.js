const fs = require('fs')
const path = require('path')

const yaml = require('js-yaml')

const getPieceImages = require('../modules/getPieceImages')


function getLilypondFilesObjects (files, songName, songsPath) {
  return files
    .filter(file => {
      return file.endsWith('.ly')
    })
    .map(fileName => {
      const filePath = `/sheetmusic/${songName}/${fileName}`
      const lilypondObject = {
        path: filePath,
        absPath: path.join(songsPath, songName, fileName),
      }

      return lilypondObject
    })
}


module.exports = (songsPath, thumbsPath, baseURL) => {
  return function (request, response) {
    const songId = request.params.name
    const requestedSongPath = path.join(songsPath, songId)
    const files = fs.readdirSync(requestedSongPath)
    const images = getPieceImages(
      files, songId, songsPath, thumbsPath, baseURL
    )
    const lilypondFiles = getLilypondFilesObjects(files, songId, songsPath)
    const renderObject = {
      page: 'sheetmusic',
      baseURL,
      song: {
        id: songId,
        name: songId
          .replace(/_/g, ' ')
          .replace(/-/g, ' - '),
        images,
        lilypondFiles: lilypondFiles,
      },
    }

    if (files.indexOf('index.yaml') === -1) {
      response.render('piece', renderObject)
    }
    else {
      fs.readFile(
        path.join(requestedSongPath, 'index.yaml'),
        'utf-8',
        (error, fileContent) => {
          if (error) throw error

          renderObject.song = Object.assign(
            renderObject.song,
            yaml.safeLoad(fileContent)
          )

          response.render('piece', renderObject)
        }
      )
    }
  }
}
