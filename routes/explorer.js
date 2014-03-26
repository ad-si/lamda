var api = require('./api')

module.exports = function (req, res) {

	api.files('/lamda/home/', function(data){
		res.render('explorer', {
			page: 'explorer',
			files: data
		})
	})
}
