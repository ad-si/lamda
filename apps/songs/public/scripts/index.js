/* globals baseURL */
// TODO: Remove globals

const shaven = require('shaven')

const playlist = []
const player = new Player()
let audio
let firstRun = true

function toggle (id) {
  if (querySelect(id).style.display === 'none') {
    querySelect(id).style.display = 'block'
  }
  else {
    querySelect(id).style.display = 'none'
  }
}

function highlight (element) {
  const links = querySelect('#c2')
    .getElementsByTagName('div')

  for (let index = 0; index < links.length; index++) {
    links[index].className = 'song'
  }
  element.className = 'highlight song'
}

function querySelect (query) {
  query = document.querySelectorAll(query)

  return query[1]
    ? query
    : query[0]
}

function Player () {
  let tempVolume

  // function setFavicon (state) {
  //   const canvas = document.createElement('canvas')
  //   const img = document.createElement('img')
  //   const querySelectfavicon = querySelect('#favicon')
  //   const link = querySelectfavicon.cloneNode(true)
  //   const faviconURL = baseURL + '/images/favicon.ico'
  //   let ctx
  //
  //   if (state) {
  //     canvas.height = canvas.width = 32
  //     ctx = canvas.getContext('2d')
  //     img.onload = function () {
  //
  //       ctx.drawImage(this, 0, 0)
  //       ctx.font = '900 28px sans-serif'
  //       ctx.fillStyle = '#FFF'
  //       ctx.fillText('\u25B6', 5, 28)
  //
  //       link.href = canvas.toDataURL('image/png')
  //       link.id = 'faviconPlay'
  //
  //       if (!querySelect('#faviconPlay')) {
  //         document.head.appendChild(link)
  //       }
  //     }
  //     img.src = faviconURL
  //   }
  //   else if (!state) {
  //     document.head.removeChild(querySelect('#faviconPlay'))
  //
  //     querySelectfavicon.href = faviconURL
  //   }
  //   else {
  //     throw new Error(`${state} is not a possible state of the favicon`)
  //   }
  // }

  function setPlayingState (state) {
    if (state === 'playing') {
      audio.play()
      querySelect('#play').className = 'playing'
      // setFavicon(true)

    }
    else if (state === 'paused') {
      audio.pause()
      querySelect('#play').className = 'paused'
      // setFavicon(false)

    }
    else {
      throw new Error('Unknown playing state:' + state)
    }
  }

  function playerUpdater () {
    querySelect('#time').innerHTML = timeElapsed()
    querySelect('#duration').innerHTML = timeLeft()
    querySelect('#progress').value = audio.currentTime
    querySelect('#progress').max = audio.duration
  }

  function timeLeft () {
    const dur = parseInt(audio.duration)
    const currentTime = parseInt(audio.currentTime)
    const spareTime = dur - currentTime
    const seconds = spareTime % 60
    const minutes = parseInt(spareTime / 60 % 60)

    return seconds < 10
      ? '- ' + minutes + ':0' + seconds
      : '- ' + minutes + ':' + seconds
  }

  function timeElapsed () {
    const seconds = parseInt(audio.currentTime % 60)
    const minutes = parseInt(audio.currentTime / 60 % 60)

    return seconds < 10
      ? minutes + ':0' + seconds
      : minutes + ':' + seconds
  }

  function showQueue () {

    toggle('#currentQueue')

    playlist.forEach(song => {
      shaven(
        [querySelect('#currentQueue'),
          ['div#.song',
            ['a', song.title],
          ],
        ]
      )
    })
  }


  this.mute = function () {
    if (audio.volume === 0) {
      player.setVolume(true)
    }
    else {
      player.setVolume(false)
    }
  }

  this.setVolume = (value, relative) => {
    relative = relative || false

    if (typeof value === 'number') {
      if (relative) {
        querySelect('#volume').value =
          Number(querySelect('#volume').value) + value
        audio.volume = parseFloat(querySelect('#volume').value)
      }
      else {
        audio.volume = querySelect('#volume').value = value
      }
    }
    else if (value === true) {
      audio.volume = querySelect('#volume').value = tempVolume
    }
    else if (value === false) {
      tempVolume = audio.volume
      audio.volume = querySelect('#volume').value = 0
    }
    else {
      throw new Error(value + ' is not a valid value for the volume.')
    }
  }

  this.playpause = function () {
    if (audio.paused && audio.src) {
      setPlayingState('playing')
    }
    else if (!audio.paused) {
      setPlayingState('paused')
    }
    else {
      throw new Error('No song loaded.')
    }
  }

  this.init = function () {

    audio = new Audio()
    audio.addEventListener('timeupdate', playerUpdater, false)
    audio.addEventListener('ended', () => {
      querySelect('#play').className = 'paused'
      // setFavicon(false)
      audio.currentTime = 0
      playerUpdater()
    }, false)
    audio.volume = 0.5

    /*
     shaven(
     [querySelect('#controls'),
     ['button#previous'],
     ['button#play', {'class': 'paused'}],
     ['button#next'],
     ['span#time', '0:00'],
     ['div',
     ['p#playerInfo', 'Artist - Song'],
     ['input#progress', {type: 'range', min: 0, value: 0}]
     ['div#slider.inputBar',
     ['div#.progress'],
     ['div#.handler']
     ],
     ],
     ['span#duration', '- 0:00'],
     ['button#queue'],
     ['button#shuffle'],
     ['button#repeat'],
     ['button#share'],
     ['button#mute', '-'],
     ['input#volume', {
     type: 'range',
     min: 0,
     max: 1,
     step: 0.01
     }],
     ['div#volume.inputBar',
     ['div#.progress'],
     ['div#.handler']
     ],
     ['button#loud', '+'],
     ['div#currentQueue.bubble', {style: 'display: none'}]
     ]
     )
     */

    querySelect('#play')
      .addEventListener('click', player.playpause, false)

    querySelect('#progress')
      .addEventListener('mousedown', () => {
        if (audio.src) {
          audio.removeEventListener(
            'timeupdate',
            playerUpdater,
            false
          )
        }
      }, false)

    querySelect('#progress')
      .addEventListener('mouseup', () => {
        if (audio.src) {
          audio.currentTime = parseFloat(this.value)
          audio.addEventListener('timeupdate', playerUpdater, false)
        }
      }, false)

    querySelect('#queue')
      .addEventListener('click', anEvent => {
        showQueue()
        anEvent.stopPropagation()
      })

    querySelect('#mute')
      .addEventListener('click', player.mute, false)

    querySelect('#volume')
      .addEventListener('change', () => {
        audio.volume = parseFloat(this.value)
      }, false)

    querySelect('#loud')
      .addEventListener('click', () => {
        player.setVolume(1)
      }, false)
  }
}

function ajax (url, param, func) {
  const base = `${baseURL}/api`
  const xRequest = new XMLHttpRequest()
  const querySelectspinner = querySelect('#spinner')
  let path = base + url
  let str = ''
  let response

  if (param) {
    if (typeof param === 'function') {
      func = param
    }
    else {
      for (const key in param) {
        if (param.hasOwnProperty(key)) {
          str += key + '=' + param[key] + '&'
        }
      }

      path += '?' + str
    }
  }

  if (querySelectspinner.style.display === 'none') {
    querySelectspinner.style.display = 'inline-block'
  }

  xRequest.open('get', path, true)
  xRequest.send(null)
  xRequest.onreadystatechange = () => {
    if (xRequest.readyState === 4) {
      querySelectspinner.style.display = 'none'

      if (xRequest.status === 200) {
        querySelect('#spinner').style.display = 'none'

        response = JSON.parse(xRequest.responseText)

        if (response.error) alert('Following Error occured: ' + response.error)
        else func(response)
      }
      else {
        throw new Error(
          'Http error ' + xRequest.status +
          ' occured during an ajax request to ' + path
        )
      }
    }
  }
}


const print = {}

print.artists = () => {
  querySelect('#c2').style.display = 'inline-block'
  querySelect('#c4').innerHTML = ''

  ajax(`${baseURL}/artists`, data => {
    querySelect('#c2').innerHTML = ''

    data.artists.forEach(function (artist) {
      const link = shaven(
        ['a', {href: '#'},
          artist.name,
        ]
      )[0]

      link.addEventListener('click', anEvent => {
        anEvent.preventDefault()

        highlight(this.parentNode)

        print.songs(artist.id)
        print.artist(artist.id)

        history.pushState(
          {url: artist.id},
          artist.id,
          baseURL + '/' + artist.id
        )
      })

      const container = shaven(
        ['div#.song',
          {
            title: artist.name,
          },

          [link],
          ['button', ''],
        ]
      )

      querySelect('#c2')
        .appendChild(container[0])
    })
  })
}

print.artist = (id) => {
  // Portrait
  ajax(baseURL + '/artists/' + id, artist => {
    const querySelectcolumn4 = querySelect('#c4')

    querySelectcolumn4.innerHTML = ''

    shaven(
      [querySelectcolumn4,
        ['div#artist',
          ['img', {
            src: 'http://lorempixel.com/80/80/',
            alt: 'Image of' + artist.name,
          },
          ],
          ['nav#artistNav',
            ['h2#heading', artist.name],
            ['p#country', artist.country || 'Niemandsland'],
          ],
          ['div#bio', artist.bio],
        ],
      ]
    )

  })
}

print.songs = (artistId) => {
  ajax(baseURL + '/artists/' + artistId + '/songs', (data) => {
    querySelect('#c3').innerHTML = ''

    data.songs.forEach((song) => {
      const link = shaven(['a', song.title])[0]
      const play = shaven(['button.play'])[0]
      const add = shaven(['button.add'])[0]

      shaven(
        [querySelect('#c3'),
          ['div.song',
            [play],
            [link],
          ],
        ]
      )

      shaven(
        ['div#bubble',
          [play],
          ['span.popularity'],
          ['span.duration'],
          ['span.release'],
          ['button#more'],
        ]
      )

      link.addEventListener('click', anEvent => {
        anEvent.preventDefault()
        print.song(song.id, artistId)

        // Save in history object
        const url = baseURL + '/' + artistId + '/' + song.id
        history.pushState({url: url}, song.id, url)
      })

      play.addEventListener('click', () => {
        if (song.src) {
          audio.src = song.src
        }
        else {
          throw new Error(
            'No source available for the song ' +
            song.title
          )
        }

        player.playpause()
        querySelect('#playerInfo').innerHTML = decodeURI(artistId)
          .replace('+', ' ') + ' - ' + song.title
      })

      add.addEventListener('click', () => {
        playlist.push(song)
      })

    })
  })
}

print.song = (songId, artistId) => {
  ajax(
    `${baseURL}/artists/${artistId}/songs/${songId}`,
    (song) => {
      const column4 = querySelect('#c4')

      column4.innerHTML = ''

      shaven(
        [column4,
          ['div#song',
            ['nav#songNav',
              ['h2#heading', song.title],
              ['p#trackArtist', 'by ' + song.trackArtist],
            ],
            ['img', {
              'src': 'http://lorempixel.com/80/80',
              'alt': 'Image of' + song.trackArtist},
            ],
            ['div.buttons',
              ['button#playSong', 'Play'],
              ['button#addSong', 'Add'],
              ['button#shareSong', 'Share'],
            ],
            ['div#lyrics', song.lyrics],
          ],
        ]
      )

      querySelect('#playSong')
        .addEventListener('click', () => {
          if (song.src !== '') {
            audio.src = song.src
          }
          else {
            throw new Error(
              'No source available for the song ' +
              song.title
            )
          }

          player.playpause()
          querySelect('#playerInfo').innerHTML =
            decodeURI(artistId) + ' - ' + song.title
        })

      querySelect('#addSong')
        .addEventListener('click', () => {
          playlist.push(song)
        })
    }
  )

}

print.startpage = function () {
  shaven(
    [querySelect('#c4'),
      ['h2', 'Welcome to Songs'],
    ]
  )
}


function route (state) {

  if (firstRun) {
    view()
      .index()
    querySelect('#spinner').style.display = 'none'
    firstRun = false
  }

  // History object or URL
  if (typeof state === 'object') {
    if (state.url) {
      fromURL(state.url)
    }
    else {
      throw new Error(
        'History Object does not contain an URL: ' +
        state.url
      )
    }

  }
  else if (typeof state === 'string') {
    fromURL(state)
  }
  else {
    throw new Error(
      'The variable passed to route() ' +
      'is not an object or a string: ' + state
    )
  }

  function fromURL (url) {
    const dirs = url.split('/')

    if (dirs.length === 1 && dirs[0] !== '') {
      view()
        .artist(dirs)
    }
    else if (dirs.length === 2) {
      view()
        .song(dirs)
    }
    else if (url !== '') {
      alert('This website is not available')
      throw new Error('Can not route the URL ' + url)
    }
  }
}

function view () {
  return {
    framework: () => {
      const querySelectcolumns = querySelect('#columns')

      // function showSettings () {
      //   toggle('#settingsBubble')
      // }

      shaven(
        [querySelectcolumns,
          ['div#menu',
            ['input#search', {
              type: 'search',
              placeholder: 'search',
            }],
            ['a#artists', 'Artists'],
            ['a#songs', 'Songs'],
            ['a#info', 'Infos'],
            ['a#charts', 'Charts'],
            ['a#playlists', 'Playlists'],
          ],
          ['div#c2'],
          ['div#c3'],
          ['div#c4'],
          ['div#Bubble.bubble', {style: 'display:none'}],
        ]
      )

      querySelectcolumns.addEventListener('click', () => {
        const bubbles = document.getElementsByClassName('bubble')

        for (let index = 0; index < bubbles.length; index++) {
          bubbles[index].style.display = 'none'

          bubbles[index].addEventListener('click', anEvent => {
            anEvent.stopPropagation()
          })
        }
      })

      querySelect('#search')
        .addEventListener(
          'keyup',
          anEvent => {
            anEvent.stopPropagation()
          }
        )

      querySelect('#logo')
        .addEventListener('click', () => {
          window.location = baseURL + '/'
        })

      querySelect('#charts')
        .addEventListener('click', () => {
          // print.songs()
        })

      querySelect('#artists')
        .addEventListener('click', () => {
          print.artists()
        })
    },

    index: () => {
      view()
        .framework()
      player.init()
      print.startpage()
    },

    artist: (dirs) => {
      print.artists()
      print.songs(dirs[0])
      print.artist(dirs[0])
    },

    artists: () => {
      print.artists()
    },

    song: function (dirs) {
      print.artists()
      print.songs(dirs[0])
      print.song(dirs[1], dirs[0])
    },
  }
}

function setShortcuts () {
  addEventListener('keyup', (anEvent) => {
    switch (anEvent.keyCode) {
      case 32: // spacebar
        anEvent.preventDefault()
        player.playpause()
        break
      case 37: // left
        break
      case 39: // right
        break
      case 76: // l
        player.setVolume(1)
        break
      case 77: // m
        player.mute()
        break
      default:
        break
    }

  }, false)

  addEventListener('keydown', (anEvent) => {
    switch (anEvent.keyCode) {
      case 37: // left
        break
      case 39: // right
        break
      case 38: // up
        anEvent.preventDefault()
        player.setVolume(0.05, true)
        break
      case 40: // down
        anEvent.preventDefault()
        player.setVolume(-0.05, true)
        break
      default:
        break
    }

  }, false)

}

const path = location.pathname.substr(
  baseURL.length + 1,
  location.pathname.length
)

history.replaceState({url: path}, path, baseURL + '/' + path)

route(path)

setShortcuts()

window.addEventListener('popstate', (anEvent) => {
  if (anEvent.state !== null) {
    route(anEvent.state)
  }
})
