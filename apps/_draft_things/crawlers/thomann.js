/* eslint-disable camelcase */
import puppeteer from 'puppeteer'
import yaml from 'yaml'


async function crawl (url) {

  const productDetails = {}

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)

  const title = await page.$('.rs-prod-headline h1')
  const titleText = await title?.getProperty('textContent')
  const titleJson = await titleText?.jsonValue()
  productDetails.title = titleJson?.trim()

  const brandImage = await page.$('.rs-prod-manufacturer-logo img')
  const brandText = await brandImage?.getProperty('alt')
  productDetails.brand = await brandText?.jsonValue()

  const price = await page.$('.prod-pricebox-price .primary')
  const priceText = await price?.getProperty('textContent')
  productDetails.price = (await priceText?.jsonValue())?.replace(/,/g, '.')

  const description = await page.$('.rs-prod-text h2')
  const descriptionText = await description?.getProperty('textContent')
  const descriptionJson = await descriptionText?.jsonValue()
  productDetails.description = descriptionJson?.trim()

  productDetails.key_features = await page.$$eval(
    'div.rs-prod-keyfeatures tr',
    rows => Object.fromEntries(rows.map(row =>
      [
        row.querySelector('th').textContent,
        row.querySelector('td').textContent,
      ],
    )),
  )

  productDetails.features = await page.$$eval(
    'ul.prod-features li',
    features => features.map(feature => feature.textContent),
  )

  productDetails.availability_date = await page.$$eval(
    '.info .meta-table tr',
    rows => rows
      .map(row => row.querySelector('td:nth-of-type(2)').textContent)
      .slice(-1)?.[0],
  )

  productDetails.type = 'TODO'
  productDetails.location = 'TODO'
  productDetails.website = url

  browser.close()

  return productDetails
}


async function main () {
  const cliArgs = process.argv.slice(2)

  if (cliArgs.length === 0) {
    throw new Error(
      'Usage: node apps/_draft_things/crawl.js <URL>',
    )
  }

  console.info(
    yaml.stringify(await crawl(cliArgs[0])),
  )
}


main()
