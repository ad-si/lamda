const fs = require('fs')
const path = require('path')

const getPieceImages = require('../modules/getPieceImages')


module.exports = (songsPath, thumbsPath, baseURL) => {
  return (request, response) => {
    const songId = request.params.name
    const files = fs.readdirSync(path.join(songsPath, songId))
    const images = getPieceImages(
      files, songId, songsPath, thumbsPath, baseURL
    )

    response.render('raw', {
      page: 'raw',
      baseURL,
      song: {
        id: songId,
        images,
      },
      style: request.query.style,
    })
  }
}
