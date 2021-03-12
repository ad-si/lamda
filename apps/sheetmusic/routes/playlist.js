import fs from 'fs'
import path from 'path'

import yaml from 'js-yaml'


export default function (playlistsPath, baseURL) {
  return (request, response) => {
    const playlistPath = path.join(playlistsPath, request.params.id)
    const playlistData = yaml.load(
      fs.readFileSync(
        path.join(playlistPath, 'index.yaml'),
        'utf-8',
      ),
    )

    playlistData.songs = playlistData.songs.map(songId => {
      return {
        id: songId,
        url: `${baseURL}/${songId}`,
      }
    })

    response.render('playlist', {
      page: 'playlist',
      playlist: playlistData,
    })
  }
}
