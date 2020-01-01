// TODO: Use browserify to load javascript
/* global things, shaven */

const typeMap = {
  jeans: 'pants',
  chino: 'pants',
  corduroys: 'pants',
  trousers: 'pants',

  // TODO: Reverse map direction and allow injective entries
  // 'pajama pants': 'pants',
  'pajama pants': 'pajamas',

  'bicycle-gear': 'bicycle',

  boxershorts: 'boxers',
  'boxer shorts': 'boxers',

  pocketknife: 'tool',
  'pocket knife': 'tool',
  multimeter: 'tool',
  'digital caliper': 'tool',
  ruler: 'tool',
  tweezers: 'tool',

  belt: 'belt',

  'button up': 'button-up',
  'button-up': 'button-up',

  adapter: 'cable',
  wire: 'cable',
  'hdmi wire': 'cable',
  'hdmi-wire': 'cable',
  cable: 'cable',
  'power cord': 'cable',
  'power-cord': 'cable',

  coat: 'jacket',

  pullover: 'sweater',
  sweatshirt: 'sweater',
  'sweat shirt': 'sweater',
  hoodie: 'sweater',
  'hooded zipper': 'sweater',

  // Music gear
  microphone: 'music-gear',
  instrument: 'music-gear',
  'alto-saxophone': 'music-gear',
  saxophone: 'music-gear',
  headphones: 'music-gear',
  earphones: 'music-gear',

  // Houseware
  homeware: 'houseware',

  stockings: 'socks',

  'polo shirt': 't-shirt',

  boots: 'shoes',
  'hiking-boots': 'shoes',
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
    element.addEventListener('click', event => {
      document
        .getElementById('thingsContainer')
        .innerHTML = ''

      const filterType = element.id

      things
        .filter(thing => {
          const thingType = typeMap[thing.type] || thing.type
          return (filterType === 'all') ||
            (thingType === filterType)
        })
        .forEach(thing => {
          shaven.default(
            [document.querySelector('#thingsContainer'),
              ['div',
                ['a', {href: thing.url},
                  ['img',
                    {src: thing.image || 'icons/thing.svg'},
                    hideSpinnerOnLoad,
                  ],
                ],
              ],
            ]
          )
        })
    })
  })
