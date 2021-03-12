/* eslint-disable id-length */

import svgKit from '../../svgKit.js'

const defaults = {
  width: 26,
  height: 26,
  scale: 1,
}

export const targetVersion = '0.3.0'

export function shaven (conf) {

  conf = svgKit.applyDefaults(conf, defaults)


  return [
    'svg', {
      width: conf.scaledWidth,
      height: conf.scaledHeight,
      viewBox: [0, 0, conf.width, conf.height].join(),
    },
    ['g',
      ['path', {
        d: 'M10,1' +
          'c0,1 6,1 6,0' +

          // Sleeve
          'l4,1' +
          'l4,4' +
          'l1,16' +
          'h-4' +
          'l-1,-13' +

          // Body
          'v15' +
          'h-14' +
          'v-15' +

          // Sleeve
          'l-1,13' +
          'h-4' +
          'l1,-16' +
          'l4,-4' +
          'l4,-1' +

          'z',
      }],
    ],
  ]
}
