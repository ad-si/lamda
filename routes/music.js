const fs = require('fs')
const path = require('path')

const music = {}


function removeFileExtension (string) {
  return string.replace(/\.[^/.]+$/, '')
}

function isSong (fileName) {
  return fileName.search(/.+\.(mp3|wav|ogg|m4a)$/gi) !== -1
}


music.song = function (request, response) {
  const songId = request.params.songId

  response.send({
    id: songId,
    title: removeFileExtension(songId),
    trackArtist: request.params.artistId,
    lyrics: 'Foo bar',
    src: [
      request.app.locals.baseURL,
      'raw',
      request.params.artistId,
      songId,
    ].join('/'),
  })
}

music.songs = function (request, response) {

  const musicDir = path.join(request.app.locals.basePath, 'music')

  const artistId = request.params.artistId
  let songs = []

  if (artistId) {

    songs = fs
      .readdirSync(path.join(musicDir, artistId))
      .filter(isSong)
      .map((songId) => {
        return {
          id: songId,
          title: removeFileExtension(songId),
        }
      })

    response.send({songs: songs})
  }

  else {

    response.send({songs: []})

    /*
     artistDirs.forEach(function (artistDir) {

     var filePath = path.join(global.baseURL, 'music', artistDir)

     fs.readFile(
     filePath,
     {encoding: 'utf-8'},
     function (error, fileContent) {

     if (error) throw error

     // TODO

     if (songs.length === artistCounter) {

     response.render('index', {
     page: 'things',
     songs: songs
     })
     }
     }
     )
     })
     */
  }

}

music.artist = function (request, response) {

  response.send({
    id: request.params.artistId,
    name: request.params.artistId,
  })
}

music.artists = function (request, response) {

  const musicDir = path.join(request.app.locals.basePath, 'music')
  const artistDirs = fs.readdirSync(musicDir)
  const artists = []
  let artistsCounter = artistDirs.length

  artistDirs.forEach((artistDir) => {
    fs.lstat(path.join(musicDir, artistDir), (error, stats) => {
      if (error) throw error

      if (stats.isDirectory()) {
        artists.push({
          id: artistDir,
          name: artistDir,
        })
      }
      else {
        artistsCounter--
      }

      console.info(artists.length, artistsCounter)

      if (artists.length === artistsCounter) {
        response.send({artists: artists})
      }
    })
  })
}

module.exports = music
