import fs from 'fs'
import path from 'path'

import yaml from 'js-yaml'


export default function (playlistsPath) {
  return (request, response) => {
    const playlistDirs = fs.readdirSync(playlistsPath)
    const playlists = []

    playlistDirs.forEach(playlistDir => {
      try {
        const playlistData = yaml.load(fs.readFileSync(
          path.join(playlistsPath, playlistDir, 'index.yaml'),
          'utf-8',
        ))

        playlistData.id = playlistDir

        playlists.push(playlistData)
      }
      catch (error) {
        if (error.code !== 'ENOTDIR') {
          console.error(error)
        }
      }
    })

    response.render('playlists', {
      page: 'playlists',
      playlists: playlists,
    })
  }
}
