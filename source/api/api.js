const files = require('../api/files')
const events = require('../api/events')
const music = require('../api/music')


module.exports.files = (request, loadCallback) => {
  let path = ''

  if (request.params) {
    path = '/' + request.params[0]
  }

  files(path, loadCallback)
}

module.exports.events = (request, response) => {
  // let path = ''
  //
  // if (request.params) {
  //   path = '/' + request.params[0]
  // }

  response.send(events())
}

module.exports.music = {
  song: (request, response) => {
    // const path = ''

    // console.log(JSON.stringify(request, null, 2))
    // console.log(request)

    // response.send(music())

    music(request, response, response.send)

    // if(request.params)
    //   path = '/' + req.params[0]

    // files(path, function (data) {
    //   callback(data)
    // })
  },
  songs: () => {},
  artist: () => {},
  artists: () => {},
}
