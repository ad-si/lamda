// TODO: Use browserify to load javascript

!function () {

	var typeMap = {
		jeans: 'pants',
		corduroys: 'pants',
		trousers: 'pants',
		boxershorts: 'boxers'
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
