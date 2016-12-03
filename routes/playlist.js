const fs = require('fs')
const path = require('path')

const yaml = require('js-yaml')


module.exports = (playlistsPath, baseURL) => {
  return (request, response) => {
    const playlistPath = path.join(playlistsPath, request.params.id)
    const playlistData = yaml.safeLoad(
      fs.readFileSync(
        path.join(playlistPath, 'index.yaml'),
        'utf-8'
      )
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
