!function (window, document) {

	var baseURL = '', //TODO: use app.locals.baseURL
		playlist = [],
		player = new Player(),
		audio,
		firstRun = true


	function toggle (id) {

		if ($(id).style.display === 'none')
			$(id).style.display = 'block'

		else
			$(id).style.display = 'none'
	}

	function highlight (element) {

		var links = $('#c2').getElementsByTagName('div')

		for (var i = 0; i < links.length; i++) {
			links[i].className = 'song'
		}
		element.className = 'highlight song'
	}

	function $ (query) {
		query = document.querySelectorAll(query)

		return (query[1]) ? query : query[0]
	}

	function Player () {

		var tempVolume


		function setFavicon (state) {

			var ctx,
				canvas = document.createElement('canvas'),
				img = document.createElement('img'),
				$favicon = $('#favicon'),
				link = $favicon.cloneNode(true)


			if (state) {
				canvas.height = canvas.width = 32
				ctx = canvas.getContext('2d')
				img.onload = function () {

					ctx.drawImage(this, 0, 0)
					ctx.font = '900 28px sans-serif'
					ctx.fillStyle = '#FFF'
					ctx.fillText('\u25B6', 5, 28)

					link.href = canvas.toDataURL('image/png')
					link.id = 'faviconPlay'

					if (!$('#faviconPlay'))
						document.head.appendChild(link)
				}
				img.src = '/img/favicon.png'
			}
			else if (!state) {

				document.head.removeChild($('#faviconPlay'))

				$favicon.href = baseURL + '/img/favicon.png'
			}
			else {
				throw new Error(
					state + ' is not a possible state of the favicon.'
				)
			}
		}

		function setPlayingState (state) {
			if (state == 'playing') {
				audio.play()
				$('#play').className = 'playing'
				setFavicon(true)

			}
			else if (state == 'paused') {
				audio.pause()
				$('#play').className = 'paused'
				setFavicon(false)

			}
			else {
				throw new Error('Unknown playing state:' + state)
			}
		}

		function playerUpdater () {
			$('#time').innerHTML = timeElapsed()
			$('#duration').innerHTML = timeLeft()
			$('#progress').value = audio.currentTime
			$('#progress').max = audio.duration
		}

		function timeLeft () {
			var dur = parseInt(audio.duration),
				currentTime = parseInt(audio.currentTime),
				timeLeft = dur - currentTime,
				s,
				m

			s = timeLeft % 60
			m = parseInt(timeLeft / 60 % 60)

			return (s < 10) ? ('- ' + m + ':0' + s) : ('- ' + m + ':' + s)
		}

		function timeElapsed () {
			var s = parseInt(audio.currentTime % 60)
			var m = parseInt(audio.currentTime / 60 % 60)

			return (s < 10) ? (m + ':0' + s) : (m + ':' + s)
		}

		function showQueue () {

			toggle('#currentQueue')

			playlist.forEach(function (song) {
				shaven(
					[$('#currentQueue'),
						['div#.song',
							['a', song.title]
						]
					]
				)
			})
		}


		this.mute = function () {

			if (audio.volume == 0)
				player.setVolume(true)

			else
				player.setVolume(false)
		}

		this.setVolume = function (n, relative) {

			relative = relative || false

			if (typeof(n) == 'number') {
				if (relative) {
					$('#volume').value = Number($('#volume').value) + n
					audio.volume = parseFloat($('#volume').value)
				}
				else {
					audio.volume = $('#volume').value = n
				}
			}
			else if (n === true) {
				audio.volume = $('#volume').value = tempVolume
			}
			else if (n === false) {
				tempVolume = audio.volume
				audio.volume = $('#volume').value = 0
			}
			else {
				throw new Error(n + ' is not a valid value for the volume.')
			}
		}

		this.playpause = function () {

			if (audio.paused && audio.src)
				setPlayingState('playing')

			else if (!audio.paused)
				setPlayingState('paused')

			else
				throw new Error('No song loaded.')
		}

		this.init = function () {

			audio = new Audio()
			audio.addEventListener('timeupdate', playerUpdater, false)
			audio.addEventListener('ended', function () {
				$('#play').className = 'paused'
				setFavicon(false)
				audio.currentTime = 0
				playerUpdater()
			}, false)
			audio.volume = 0.5

			/*
			 shaven(
			 [$('#controls'),
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

			$('#play').addEventListener('click', player.playpause, false)

			$('#progress').addEventListener('mousedown', function () {
				if (audio.src)
					audio.removeEventListener(
						'timeupdate',
						playerUpdater,
						false
					)
			}, false)

			$('#progress').addEventListener('mouseup', function () {
				if (audio.src) {
					audio.currentTime = parseFloat(this.value)
					audio.addEventListener('timeupdate', playerUpdater, false)
				}
			}, false)

			$('#queue').addEventListener('click', function (e) {
				showQueue()
				e.stopPropagation()
			})

			$('#mute').addEventListener('click', player.mute, false)

			$('#volume').addEventListener('change', function () {
				audio.volume = parseFloat(this.value)
			}, false)

			$('#loud').addEventListener('click', function () {
				player.setVolume(1)
			}, false)
		}
	}

	function ajax (url, param, func) {

		var base = '/music/api',
			x = new XMLHttpRequest(),
			$spinner = $('#spinner'),
			path = base + url,
			str = '',
			res,
			a


		if (param)
			if (typeof param === 'function') {
				func = param
			}
			else {
				for (a in param)
					if (param.hasOwnProperty(a))
						str += a + '=' + param[a] + '&'

				path += '?' + str
			}

		if ($spinner.style.display == 'none')
			$spinner.style.display = 'inline-block'


		x.open('get', path, true)
		x.send(null)
		x.onreadystatechange = function () {

			if (x.readyState == 4) {

				$spinner.style.display = 'none'

				if (x.status == 200) {

					$('#spinner').style.display = 'none'

					res = JSON.parse(x.responseText)

					if (res.error)
						alert('Following Error occured: ' + res.error)
					else
						func(res)
				}
				else {
					throw new Error(
						'Http error ' + x.status +
						' occured during an ajax request to ' + path
					)
				}
			}
		}
	}


	var print = {}

	print.artists = function () {

		$('#c2').style.display = 'inline-block'
		$('#c4').innerHTML = ''


		ajax('/artists', function (data) {

			$('#c2').innerHTML = ''

			data.artists.forEach(function (artist) {

				var link = shaven(
					['a', {href: '#'},
						artist.name
					]
				)[0]


				link.addEventListener('click', function (e) {

					e.preventDefault()

					highlight(this.parentNode)

					print.songs(artist.id)
					print.artist(artist.id)

					history.pushState(
						{url: artist.id},
						artist.id,
						baseURL + '/' + artist.id
					)
				})

				var container = shaven(
					['div#.song',
						{
							title: artist.name
						},

						[link],
						['button', '']
					]
				)

				$('#c2').appendChild(container[0])
			})
		})
	}

	print.artist = function (id) {

		// Portrait
		ajax('/artists/' + id, function (artist) {

			var $column4 = $('#c4')

			$column4.innerHTML = ''

			shaven(
				[$column4,
					['div#artist',
						['img', {
							src: 'http://lorempixel.com/80/80/',
							alt: 'Image of' + artist.name
						}
						],
						['nav#artistNav',
							['h2#heading', artist.name],
							['p#country', artist.country || 'Niemandsland']
						],
						['div#bio', artist.bio]
					]
				]
			)

		})
	}

	print.songs = function (artistId) {

		ajax('/artists/' + artistId + '/songs', function (data) {

			$('#c3').innerHTML = ''

			data.songs.forEach(function (song) {

				var link = shaven(['a', song.title])[0],
					play = shaven(['button.play'])[0],
					add = shaven(['button.add'])[0]

				shaven(
					[$('#c3'),
						['div.song',
							[play],
							[link]
						]
					]
				)

				shaven(
					['div#bubble',
						[play],
						['span.popularity'],
						['span.duration'],
						['span.release'],
						['button#more']
					]
				)


				link.addEventListener('click', function (e) {

					var url

					e.preventDefault()
					print.song(song.id, artistId)

					//Save in history object
					url = baseURL + '/' + artistId + '/' + song.id
					history.pushState({url: url}, song.id, url)
				})


				play.addEventListener('click', function () {

					if (song.src)
						audio.src = song.src
					else {
						throw new Error(
							'No source available for the song ' +
							song.title
						)
					}

					player.playpause()
					$('#playerInfo')
						.innerHTML = decodeURI(artistId).replace('+', ' ') +
					                 ' - ' + song.title
				})

				add.addEventListener('click', function () {
					playlist.push(song)
				})

			})
		})
	}

	print.song = function (songId, artistId) {

		ajax('/artists/' + artistId + '/songs/' + songId, function (song) {

			var column4 = $('#c4')

			column4.innerHTML = ''

			shaven(
				[column4,
					['div#song',
						['nav#songNav',
							['h2#heading', song.title],
							['p#trackArtist', 'by ' + song.trackArtist]
						],
						['img', {
							'src': 'http://lorempixel.com/80/80',
							'alt': 'Image of' + song.trackArtist}
						],
						['div.buttons',
							['button#playSong', 'Play'],
							['button#addSong', 'Add'],
							['button#shareSong', 'Share']
						],
						['div#lyrics', song.lyrics]
					]
				]
			)

			$('#playSong').addEventListener('click', function () {

				if (song.src != '')
					audio.src = song.src
				else {
					throw new Error(
						'No source available for the song ' +
						song.title
					)
				}

				player.playpause()
				$('#playerInfo').innerHTML = decodeURI(artistId) +
				                             ' - ' + song.title
			})

			$('#addSong').addEventListener('click', function () {
				playlist.push(song)
			})
		})

	}

	print.startpage = function () {
		shaven(
			[$('#c4'),
				['h2', 'Welcome to the music'
				]
			]
		)
	}


	function route (state) {

		if (firstRun) {
			view().index()
			$('#spinner').style.display = 'none'
			firstRun = false
		}

		// History object or URL
		if (typeof(state) == 'object') {

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
		else if (typeof(state) == 'string') {
			fromURL(state)
		}
		else {
			throw new Error('The variable passed to route() ' +
			                'is not an object or a string: ' + state)
		}

		function fromURL (url) {

			var dirs = url.split('/')

			if (dirs.length == 1 && dirs[0] != '')
				view().artist(dirs)

			else if (dirs.length == 2)
				view().song(dirs)

			else if (url !== '') {
				alert('This website is not available')
				throw new Error('Can not route the URL ' + url)
			}
		}
	}

	function view () {

		return {
			framework: function () {

				var $columns = $('#columns')

				function showSettings () {
					toggle('#settingsBubble')
				}

				shaven(
					[$columns,
						['div#menu',
							['input#search', {
								type: 'search',
								placeholder: 'search'
							}],
							['a#artists', 'Artists'],
							['a#songs', 'Songs'],
							['a#info', 'Infos'],
							['a#charts', 'Charts'],
							['a#playlists', 'Playlists']
						],
						['div#c2'],
						['div#c3'],
						['div#c4'],
						['div#Bubble.bubble', {style: 'display:none'}]
					]
				)


				$columns.addEventListener('click', function () {

					var bubbles = document.getElementsByClassName('bubble'),
						a

					for (a = 0; a < bubbles.length; a++) {

						bubbles[a].style.display = 'none'

						bubbles[a].addEventListener('click', function (e) {
							e.stopPropagation()
						})
					}
				})

				var addEventListener = $('#search').addEventListener(
					'keyup',
					function (e) {
						e.stopPropagation()
					})

				$('#logo').addEventListener('click', function () {
					window.location = baseURL + '/'
				})

				$('#charts').addEventListener('click', function () {
					//print.songs()
				})

				$('#artists').addEventListener('click', function () {
					print.artists()
				})
			},

			index: function () {
				view().framework()
				player.init()
				print.startpage()
			},

			artist: function (dirs) {
				print.artists()
				print.songs(dirs[0])
				print.artist(dirs[0])
			},

			artists: function () {
				print.artists()
			},

			song: function (dirs) {
				print.artists()
				print.songs(dirs[0])
				print.song(dirs[1], dirs[0])
			}
		}
	}

	function setShortcuts () {

		addEventListener('keyup', function (e) {

			switch (e.keyCode) {
				case 32: //spacebar
					e.preventDefault()
					player.playpause()
					break
				case 37: //left
					break
				case 39: //right
					break
				case 76: //l
					player.setVolume(1)
					break
				case 77: //m
					player.mute()
					break
			}

		}, false)

		addEventListener('keydown', function (e) {

			switch (e.keyCode) {
				case 37: //left
					break
				case 39: //right
					break
				case 38: //up
					e.preventDefault()
					player.setVolume(0.05, true)
					break
				case 40: //down
					e.preventDefault()
					player.setVolume(-0.05, true)
					break
			}

		}, false)

	}


	!function () {

		var path = location.pathname.substr(
			baseURL.length + 1,
			location.pathname.length
		)

		history.replaceState({url: path}, path, baseURL + '/' + path)

		route(path)

		setShortcuts()

		window.addEventListener('popstate', function (event) {
			if (event.state !== null)
				route(event.state)
		})

	}()

}(window, document)
