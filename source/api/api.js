import * as apiFiles from '../api/files'
import * as apiEvents from '../api/events'
import * as apiMusic from '../api/music'


export function files (request, loadCallback) {
  let path = ''

  if (request.params) {
    path = '/' + request.params[0]
  }

  apiFiles(path, loadCallback)
}

export function events (request, response) {
  // let path = ''
  //
  // if (request.params) {
  //   path = '/' + request.params[0]
  // }

  response.send(apiEvents())
}

export const music = {
  song: (request, response) => {
    // const path = ''

    // console.log(JSON.stringify(request, null, 2))
    // console.log(request)

    // response.send(music())

    apiMusic(request, response, response.send)

    // if(request.params)
    //   path = '/' + req.params[0]

    // apiFiles(path, function (data) {
    //   callback(data)
    // })
  },
  songs: () => {},
  artist: () => {},
  artists: () => {},
}
