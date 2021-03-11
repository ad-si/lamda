const vCard = require('vcards-js')
const mapKeys = require('mapkeys')


function json2vcf (contact) {
  const card = vCard()

  const contactNormalized = mapKeys({
    in: contact,
    mappings: [
      {from: 'name', to: 'firstName'},
      {from: ['phones', 'mobile'], to: 'cellPhone'},
      {from: 'phone', to: 'homePhone'},
      {from: 'emails', to: 'email'},
      {from: 'website', to: 'url'},
      {from: 'role', to: 'job'},
      {from: 'homeAddress', to: 'address'},
    ],
  })

  try {
    Object.assign(
      card,
      contactNormalized,
      {
        version: '4.0',
      }
    )

    // https://github.com/enesser/vCards-js/issues/27
    card.cellPhone = String(card.cellPhone)
    card.homePhone = String(card.homePhone)

    return card.getFormattedString()
  }
  catch (error) {
    console.error(error)
  }
}


/**
* Checks which contacts have birthday and sends you a reminder
* @returns {array}
*/
module.exports = async () => {
  const test = [
    { name: 'Henri Marx',
      phone: '+49123456789',
      email: 'henri@example.org',
      web: 'henri.io',
    },
    { name: 'Peter Kreuz',
      phone: 491537886315,
      organization: 'WHEKR',
      job: 'Internship',
    },
    { name: 'Abeer Marsh',
      gender: 'male',
      organization: 'Theorem',
      job: 'CEO',
      phones: [ 1411235732, 14124181767 ],
      email: 'abeer@thro.com',
      website: 'thro.com',
      address: {
        country: 'United States',
        state: 'California',
        city: 'San Francisco',
        street: '2nd Street',
        number: 1,
      },
    },
    { firstname: 'Abin',
      lastname: 'Kaso',
      gender: 'female',
      email: 'abin.kaso@gmail.com',
      address: { country: 'Germany' },
    },
    { firstname: 'Max',
      lastname: 'Backe',
      gender: 'male',
      mobile: 491861321324,
      address: { country: 'Germany' },
    },
    { firstname: 'Carl',
      lastname: 'Fischer',
      phone: { type: 'cell', number: 1724561237 },
      gender: 'male',
      address: { country: 'Germany' },
    },
    { firstname: 'Joseph',
      lastname: 'Holft',
      gender: 'male',
      emails: [
        'joseph.holft@gmail.com',
        'joseph.holft@hotmail.com',
      ],
      address: { country: 'Germany' },
    },
  ]

  return test
    .slice(0, 10)
    .map(json2vcf)
}
