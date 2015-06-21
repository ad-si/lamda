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

	function hideSpinner (element) {
		element.parentElement.style.backgroundImage = 'none'
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

	Array.prototype.slice
		.call(document.querySelectorAll('img'))
		.forEach(function(image){
			image.addEventListener(
				'load',
				function(event){
					hideSpinner(event.target)
				}
			)

			if (image.complete)
				hideSpinner(image)
		})

	Array
		.from(document.querySelectorAll('.filter'))
		.forEach(function (element) {

			element.addEventListener('click', function (event) {
				document
					.querySelector('#thingsContainer')
					.innerHTML = ''

				var filterType = this.id

				things
					.filter(function (thing) {

						var thingType = typeMap[thing.type] || thing.type

						return (filterType === 'all') ||
							(thingType === filterType)
					})
					.forEach(function (thing) {

						shaven(
							[document.querySelector('#thingsContainer'),
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
	})
}()
