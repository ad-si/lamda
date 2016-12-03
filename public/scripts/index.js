// TODO: Use browserify to load javascript
/* global things, shaven */

const typeMap = {
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
  'power-cord': 'cable',

  boots: 'shoes',
  chucks: 'shoes',
  'flip-flops': 'shoes',
  'flip flops': 'shoes',
  sneakers: 'shoes',
  'ski-boots': 'shoes',
  'ski boots': 'shoes',
}

function hideSpinner (element) {
  element.parentElement.style.backgroundImage = 'none'
}

// function checkCompletion () {
//   if (this.complete) {
//     $(this)
//       .load()
//   }
// }

function hideSpinnerOnLoad (image) {
  image.addEventListener('load', () => {
    image
      .parentElement
      .style['background-image'] = 'none'
  })
}

Array.prototype.slice
  .call(document.querySelectorAll('img'))
  .forEach(image => {
    image.addEventListener(
      'load',
      event => {
        hideSpinner(event.target)
      }
    )

    if (image.complete) {
      hideSpinner(image)
    }
  })

Array
  .from(document.querySelectorAll('.filter'))
  .forEach(element => {
    element.addEventListener('click', () => {
      document
        .querySelector('#thingsContainer')
        .innerHTML = ''

      const filterType = this.id

      things
        .filter(thing => {
          const thingType = typeMap[thing.type] || thing.type
          return (filterType === 'all') ||
            (thingType === filterType)
        })
        .forEach(thing => {
          shaven(
            [document.querySelector('#thingsContainer'),
              ['div',
                ['a', {href: thing.url},
                  ['img',
                    {src: thing.image},
                    hideSpinnerOnLoad,
                  ],
                ],
              ],
            ]
          )
        })
    })
  })
