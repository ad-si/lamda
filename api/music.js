var fs = require('fs'),

	fsToJson = require('../api/fsToJson'),
	app = {}


app.artist = function(){

}

app.artists = function (request, response, callback) {

	callback(fsToJson(baseURL + '/music'))

	/*
	fs.readdir(baseURL + '/music', function (error, files) {

		if (error) throw error

		callback(files)
	})
	*/

	/*
	 if (path === '/artists') {

	 function artists() {
	 var verzeichnispfad = 'music'
	 var artists = array_slice(scanDir(music), 2)

	 var a = {}

	 a['error'] = false

	 for (var i = 0; i < count(artists); i++) {
	 if (strpos(artists[i], '.') === false && strpos(artists[i], ':') === false) {
	 a['data'][] = {
	 'id': i,
	 'name': artists[i],
	 'slug': urlencode(artists[i])
	 }
	 }
	 }

	 return json_encode(a)
	 }

	 alert(artists())

	 } else if (path === '/artist') {

	 var artist = _GET['artist']

	 if ((_GET['songs']) && _GET['songs']) {

	 var songs = array_slice(scanDir(music + "" + '/' + "" + artist), 2)

	 var a = {}

	 for (var i = 0; i < count(songs); i++) {
	 a['data'][i] = {
	 id: i,
	 title: basename(songs[i], '.mp3'),
	 slug: urlencode(songs[i]),
	 src: "http://api.tunediver.com/music/artist/songs[i]"
	 }
	 }

	 alert(json_encode(a))

	 } else if (path === '/song') {

	 artist = _GET['artist']
	 var song = _GET['song']

	 a['data'] = {
	 id: 1,
	 title: basename(song, '.mp3'),
	 slug: urlencode(song),
	 track_artist: 'Artist',
	 lyrics: 'This are the lyrics of the Song',
	 src: "http://api.tunediver.com/music/artist/song"
	 }

	 console.log(JSON.stringify(a))

	 } else {

	 a['data'] = {
	 'name': _GET['artist'],
	 'bio': 'This is the bio of ' + "" + artist,
	 'country': 'Someland'
	 }

	 console.log(JSON.stringify(a))
	 }

	 } else if ((_GET['songs']) && _GET['songs']) {

	 } else {
	 alert('{error: true; data: "Something went wrong"}')
	 }
	 */

}


app.song = function(){

}

app.songs = function(){

}

module.exports = app


// function songs(){
// 	$artists = array_slice(scanDir($verzeichnispfad), 2)
// 	$all = array()
//
// 	foreach ($artists as $artist){
// 		if(is_dir($verzeichnispfad.'/'.$artist)){
// 			$songs = array_slice(scanDir($verzeichnispfad.'/'.$artist), 2)
// 			$all[$artist] = $songs
// 		}
// 	}
//
// 	echo json_encode($all)
// }
