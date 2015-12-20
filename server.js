'use strict'

let fs = require('fs')
let path = require('path')

let express = require('express')
let stylus = require('stylus')

let events = require('./routes/events')

let app = express()


app.set('views', __dirname + '/views')

app.get('/', events)

module.exports = app

if (!module.parent) {
	app.set('view engine', 'jade')

	let port = 3000
	app.listen(3000)
	console.log('App listens on http://localhost:' + port)
}
