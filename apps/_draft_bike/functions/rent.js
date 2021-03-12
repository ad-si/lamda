import {URL} from 'url'
import request from 'request-promise-native'
import {Cookie} from 'tough-cookie'

const engToDeu = {
  bikeId: 'Radnummer',
  startRentalNow: 'Ausleihe jetzt starten',
  numberCombination: 'Zahlenkombination',
}


async function getSessionId (iframeUrl) {
  const loginUrl = new URL(iframeUrl)
  loginUrl.searchParams.set('id', 'login')
  loginUrl.searchParams.set('L', 'de')
  loginUrl.searchParams.set('domain', 'de')

  const loginResponse = await request({
    method: 'POST',
    uri: loginUrl.toString(),
    formData: {
      logintype: 'login',
      // eslint-disable-next-line camelcase
      redirect_account: loginUrl.origin + loginUrl.pathname,
      user: process.env.nextbikeUsername,
      pass: process.env.nextbikePassword,
    },
    resolveWithFullResponse: true,
  })
  const setCookieText = loginResponse.headers['set-cookie'][0]
  const sessionId = setCookieText.match(/^PHPSESSID=(.+?);/)[1]

  return sessionId
}


async function rentBike (iframeUrl, sessionId, bikeId) {
  const rentalUrl = new URL(iframeUrl)
  rentalUrl.searchParams.set('id', 'rental')
  rentalUrl.searchParams.set('domain', 'de')

  const sessionCookie = new Cookie({
    key: 'PHPSESSID',
    value: sessionId,
  })

  const cookiejar = request.jar()
  cookiejar.setCookie(sessionCookie, rentalUrl.origin)

  const rentalPage = await request({
    uri: rentalUrl,
    jar: cookiejar,
  })

  if (!rentalPage.includes(engToDeu.bikeId)) {
    throw new Error([
      'PHP session id expired.',
      'Response:',
      rentalPage,
    ].join('\n'))
  }

  const rentalResponse = await request({
    method: 'POST',
    uri: rentalUrl.toString(),
    jar: cookiejar,
    form: {
      'tx_nbcust_pi1[bike_no]': bikeId,
      'tx_nbcust_pi1[rent]': engToDeu.startRentalNow,
    },
  })
  const lockCode = rentalResponse
    .match(/Zahlenkombination ([0-9]+)/)[1]

  return {
    lockCode,
  }
}


/**
* Get the keycode of the bike lock
* @param {String} bikeId ID of bicycle which shall be rented
* @param {String} token Authentication token
* @returns {Object}
*/
export default async function (bikeId, token) {
  if (token !== process.env.nextbikeToken) {
    return '404'
  }

  if (!bikeId) {
    return 'A bike ID must be specified'
  }

  const host = 'iframe.nextbike.net'
  const iframeUrl = `https://${host}/iframe/`

  const sessionId = await getSessionId(iframeUrl)
  const rentalResponse = await rentBike(iframeUrl, sessionId, bikeId)

  return rentalResponse
}
