const express = require('express')
const index = require('./routes/index')
const app = express()


app.set('views', `${__dirname}/views`)

app.get('/', index)

module.exports = app
