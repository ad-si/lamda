// TODO: Use browserify to load javascript

!function () {

	var typeMap = {
		jeans: 'pants',
		chino: 'pants',
		corduroys: 'pants',
		trousers: 'pants',
		boxershorts: 'boxers',
		'boxer shorts': 'boxers',
		pocketknife: 'tool',
		'pocket knife': 'tool',
		multimeter: 'tool',
		'digital caliper': 'tool',
		belt: 'belt',
		'button up': 'button-up',
		'button-up': 'button-up',
		'wire': 'cable',
		'hdmi wire': 'cable',
		'hdmi-wire': 'cable',
		'cable': 'cable',
		'power cord': 'cable',
		'power-cord': 'cable'
	}

	function hideSpinner (event) {
		$(event.target)
			.closest('a')
			.css('background-image', 'none')
	}

	function checkCompletion () {

		if (this.complete)
			$(this).load()
	}

	function hideSpinnerOnLoad (image) {

		image.addEventListener('load', function () {
			image
				.parentElement
				.style['background-image'] = 'none'
		})
	}

	$('img')
		.one('load', hideSpinner)
		.each(checkCompletion)

	$('.filter').click(function (event) {

		$('#thingsContainer').empty()

		var filterType = event.delegateTarget.id


		things
			.filter(function (thing) {

				var thingType = typeMap[thing.type] || thing.type

				return (filterType === 'all') || (thingType === filterType)
			})
			.forEach(function (thing) {

				shaven(
					[$('#thingsContainer')[0],
						['div',
							['a', {href: thing.url},
								['img',
									{src: thing.image},
									hideSpinnerOnLoad
								]
							]
						]
					]
				)
			})
	})
}()
