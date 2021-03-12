import fs from 'fs'
import path from 'path'

export default function fsToJson (filename) {
  const stats = fs.lstatSync(filename)
  const info = {
    path: filename,
    name: path.basename(filename),
  }

  if (stats.isDirectory()) {
    info.type = 'folder'
    info.children = fs
      .readdirSync(filename)
      .map(child => fsToJson(filename + '/' + child))
  }
  else {
    // Assuming it's a file. In real life it could be a symlink or
    // something else!
    info.type = 'file'
  }

  return info
}
