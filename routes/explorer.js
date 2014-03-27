var files = require('../api/files')

module.exports = function (req, res) {

	var pathParam = req.params[0] || ''

	files(pathParam, function(data){

		res.render('explorer', {
			page: 'explorer',
			files: data
		})
	})
}
