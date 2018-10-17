const fs = require('fs')
const path = require('path')

const isImage = require('is-image')
const imageResizer = require('image-resizer-middleware')


function createThumbnail (songName, image, thumbsPath) {
  const songThumbsPath = path.join(thumbsPath, songName)

  if (!fs.existsSync(thumbsPath)) {
    fs.mkdirSync(thumbsPath)
  }
  if (!fs.existsSync(songThumbsPath)) {
    fs.mkdirSync(songThumbsPath)
  }

  imageResizer.addToQueue(image)
  return true
}


module.exports = (files, songName, songsPath, thumbsPath, baseURL) => {
  return files
    .filter(isImage)
    .map(fileName => {
      const imageURL = `${baseURL}/${songName}/${fileName}`
      const maxWidth = 2000
      const maxHeight = 2000

      const image = {
        path: imageURL,
        thumbnailPath: imageURL +
          `?maximum-size=${maxWidth}x${maxHeight}`,
        absPath: path.join(songsPath, songName, fileName),
        absThumbnailPath: path.join(thumbsPath, songName, fileName),
      }

      createThumbnail(songName, image, thumbsPath)
      return image
    })
}
