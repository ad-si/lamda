import fs from 'fs'
import path from 'path'

import isImage from 'is-image'


export default function (songsPath) {
  return function (request, response) {
    const songs = []
    const songDirs = fs.readdirSync(songsPath)
    let numberOfDirectories = songDirs.length

    songDirs.forEach(songDir => {
      const dirPath = path.join(songsPath, songDir)
      let files

      const isDirectory = fs
        .lstatSync(dirPath)
        .isDirectory()

      if (isDirectory && songDir[0] !== '.') {
        files = fs.readdirSync(dirPath)
      }
      else {
        numberOfDirectories--
        return
      }

      const images = files
        .filter(isImage)
        .map(fileName => {
          return path.join(songDir, fileName)
        })

      songs.push({
        id: songDir,
        images,
      })

      if (songs.length === numberOfDirectories) {
        response.render('pieces', {
          page: 'sheetmusic',
          songs: songs,
        })
      }
    })
  }
}
