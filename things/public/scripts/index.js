// TODO: Use browserify to load javascript
/* global things, shaven */

const typeMap = {
  // Pants
  'jeans': 'pants',
  'chino': 'pants',
  'corduroys': 'pants',
  'trousers': 'pants',

  // TODO: Reverse map direction and allow injective entries
  // 'pajama pants': 'pants',
  'pajama pants': 'pajamas',

  // Bicycle
  'bicycle-gear': 'bicycle',
  'stem': 'bicycle',
  'chain': 'bicycle',

  // Boxers
  'boxershorts': 'boxers',
  'boxer shorts': 'boxers',

  // Shorts
  'boardshorts': 'shorts',

  // Tool
  'craft': 'tool',
  'digital caliper': 'tool',
  'glue-gun': 'tool',
  'multimeter': 'tool',
  'pocket knife': 'tool',
  'pocketknife': 'tool',
  'ruler': 'tool',
  'solder-station': 'tool',
  'tweezers': 'tool',

  // Battery
  'button cell': 'battery',

  'belt': 'belt',

  'button up': 'button-up',
  'button-up': 'button-up',

  // Cable
  'adapter': 'cable',
  'wire': 'cable',
  'hdmi wire': 'cable',
  'hdmi-wire': 'cable',
  'cable': 'cable',
  'cord': 'cable',
  'power cord': 'cable',
  'power-cord': 'cable',

  // Headgear
  'beanie': 'headgear',
  'hat': 'headgear',
  'scarf': 'headgear',

  'coat': 'jacket',

  // Sweater
  'fleece': 'sweater',
  'longsleeve': 'sweater',
  'pullover': 'sweater',
  'sweatshirt': 'sweater',
  'sweat shirt': 'sweater',
  'hoodie': 'sweater',
  'hooded zipper': 'sweater',

  // Music gear
  'acoustic adhesive': 'music-gear',
  'alto-saxophone': 'music-gear',
  'capo': 'music-gear',
  'drumhead': 'music-gear',
  'ear-plugs': 'music-gear',
  'earphones': 'music-gear',
  'headphones': 'music-gear',
  'instrument': 'music-gear',
  'keyboard': 'music-gear',
  'microphone': 'music-gear',
  'midi-controller': 'music-gear',
  'saxophone': 'music-gear',
  'sound-absorber': 'music-gear',
  'tenor-saxophone': 'music-gear',
  'ukulele': 'music-gear',

  // Houseware
  'bedframe': 'houseware',
  'blanket': 'houseware',
  'furniture': 'houseware',
  'homeware': 'houseware',
  'pillow': 'houseware',
  'sheet': 'houseware',
  'washing machine': 'houseware',

  // 'Kitchenware'
  'bottle': 'kitchenware',
  'cup': 'kitchenware',
  'dishes': 'kitchenware',
  'plate': 'kitchenware',

  // Baggage
  'backpack': 'baggage',
  'bag': 'baggage',
  'case': 'baggage',
  'container': 'baggage',
  'suitcase': 'baggage',
  'wallet': 'baggage',

  // Gadget
  '3d-printer': 'gadget',
  'calculator': 'gadget',
  'charger': 'gadget',
  'display': 'gadget',
  'hard-drive': 'gadget',
  'hub': 'gadget',
  'keyboard': 'gadget',
  'laptop': 'gadget',
  'lock': 'gadget',
  'music-player': 'gadget',
  'mouse': 'gadget',
  'micro-sd-card': 'gadget',
  'monitor': 'gadget',
  'nas': 'gadget',
  'padlock': 'gadget',
  'paracord': 'gadget',
  'printer': 'gadget',
  'phone': 'gadget',
  'printer cartridge': 'gadget',
  'router': 'gadget',
  'repeater': 'gadget',
  'shaver': 'gadget',
  'sim-card': 'gadget',
  'smartphone': 'gadget',
  'storage-card': 'gadget',
  'stylus': 'gadget',
  'tablet': 'gadget',
  'tripod': 'gadget',
  'usb-stick': 'gadget',
  'usb hub': 'gadget',
  'audio system': 'gadget',

  // Sport
  'racket': 'sport',
  'frisbee': 'sport',
  'back-protector': 'sport',

  // DIY
  'solder': 'diy',
  'craft-supply': 'diy',
  'pencil': 'diy',

  // Sanitary Articles
  'sanitary-product': 'sanitary-article',
  'hygiene-article': 'sanitary-article',
  'hygiene-product': 'sanitary-article',
  'lip-balm': 'sanitary-article',
  'shampoo': 'sanitary-article',
  'deodorant': 'sanitary-article',
  'hair powder': 'sanitary-article',
  'perfume': 'sanitary-article',

  'stockings': 'socks',

  // T-Shirt
  'polo shirt': 't-shirt',

  // Shoes
  'boots': 'shoes',
  'chucks': 'shoes',
  'flip flops': 'shoes',
  'flip-flops': 'shoes',
  'hiking-boots': 'shoes',
  'running-shoes': 'shoes',
  'ski boots': 'shoes',
  'ski-boots': 'shoes',
  'sneakers': 'shoes',
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
