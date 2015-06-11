module.exports.shaven = function (conf, tools) {

	var defaults = {
		width: 100,
		height: 100,
		scale: 1
	}

	conf = tools.applyDefaults(conf, defaults)

	return [
		'svg', {
			width: conf.width,
			height: conf.height,
			viewBox: [0, 0, 8, 6].join()
		},
		['g',
			{
				style: {
					fill: 'none',
					'stroke-width': 0.2,
					stroke: 'black'
				}
			},

			['path', {
				d:	// Outline
					'M1,2' +
					'l2,-1' +
					'l2,1' +
					'v2' +
					'l-2,1' +
					'l-2,-1' +
					'z' +

					// Front corner
					'M1,2' +
					'l2,1' +
					'v2' +

					'M3,3' +
					'l2,-1' +

					// Slit
					'M2,2.5' +
					'l2,-1'
			}]
		]
	]
}
