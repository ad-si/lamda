var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml')


module.exports = function (req, res) {

	var data = [
		{
			title: 'Datum 1'
		},
		{
			title: 'Datum 2'
		},
		{
			title: 'Datum 3'
		}
	]

	res.render('index', {
		data: data
	})
}
