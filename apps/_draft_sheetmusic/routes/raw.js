import fs from 'fs'
import path from 'path'

import getPieceImages from '../modules/getPieceImages.js'


export default function (songsPath, thumbsPath, baseURL) {
  return (request, response) => {
    const songId = request.params.name
    const files = fs.readdirSync(path.join(songsPath, songId))
    const images = getPieceImages(
      files, songId, songsPath, thumbsPath, baseURL,
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
