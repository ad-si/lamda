/* eslint-disable camelcase */
import puppeteer from 'puppeteer'
import yaml from 'yaml'


async function crawl (asinOrUrl) {
  const url = asinOrUrl.includes('http')
    ? asinOrUrl
    : `https://www.amazon.com/dp/${asinOrUrl}`

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)

  const [img] = await page.$x('//*[@id="landingImage"]')
  const imageSource = await img?.getProperty('src')
  const imageSourceJson = await imageSource?.jsonValue()

  const [title] = await page.$x('//*[@id="productTitle"]')
  const titleText = await title?.getProperty('textContent')
  const titleJson = await titleText?.jsonValue()
  const finalTitle = titleJson
    ?.replace('\\n', '')
    .trim()

  const [price] = await page.$x('//*[@id="priceblock_ourprice"]')
  const priceText = await price?.getProperty('textContent')
  const priceJson = await priceText?.jsonValue()
  const finalPrice = priceJson
    ?.replace(/\\n/g, '')
    .replace(/,/g, '.')
    .trim()

  const [originalPrice] = await page
    .$x('//*[@id="price"]/table/tbody/tr[1]/td[2]/span[1]')
  const originalPriceText = await originalPrice?.getProperty('textContent')
  const originalPriceJson = await originalPriceText?.jsonValue()
  const finalOriginalPrice = originalPriceJson
    ?.replace('\\n', '')
    .trim()

  const [savingPrice] = await page.$x('//*[@id="regularprice_savings"]/td[2]')
  const savingPriceText = await savingPrice?.getProperty('textContent')
  const savingPriceJson = await savingPriceText?.jsonValue()
  const finalSavingPrice = savingPriceJson
    ?.replace('\\n', '')
    .trim()

  const [deliveryDate] = await page.$x('//*[@id="ddmDeliveryMessage"]')
  const deliveryDateText = await deliveryDate?.getProperty('textContent')
  const deliveryDateJson = await deliveryDateText?.jsonValue()
  const finalDeliveryDate = deliveryDateJson
    ?.replace('\\n', '')
    .trim()

  const [modelNumber] = await page
    .$x('//*[@id="variation_style_name"]/div/span')
  const modelNumberText = await modelNumber?.getProperty('textContent')
  const modelNumberJson = await modelNumberText?.jsonValue()
  const finalModelNumber = modelNumberJson
    ?.replace('\\n', '')
    .trim()

  const [shippingPrice] = await page.$x('//*[@id="price-shipping-message"]')
  const shippingPriceText = await shippingPrice?.getProperty('textContent')
  const shippingPriceJson = await shippingPriceText?.jsonValue()
  const finalShippingPrice = shippingPriceJson
    ?.replace('\\n', '')
    .trim()

  const [emiDetail] = await page.$x('//*[@id="inemi_feature_div"]/span[2]')
  const emiDetailText = await emiDetail?.getProperty('textContent')
  const emiDetailJson = await emiDetailText?.jsonValue()
  const finalEmiDetail = emiDetailJson
    ?.replace('\\n', '')
    .trim()

  const [merchant] = await page.$x('//*[@id="merchant-info"]')
  const merchantText = await merchant?.getProperty('textContent')
  const merchantJson = await merchantText?.jsonValue()
  const finalMerchant = merchantJson
    ?.replace('\\n', '')
    .trim()

  const [feature] = await page.$x('//*[@id="feature-bullets"]')
  const featureText = await feature?.getProperty('textContent')
  const featureJson = await featureText?.jsonValue()
  const finalFeatures = featureJson
    ?.replace('\\n', '')
    .trim()

  const [description] = await page.$x('//*[@id="productDescription"]')
  const descriptionText = await description?.getProperty('textContent')
  const descriptionJson = await descriptionText?.jsonValue()
  const finalDescription = descriptionJson
    ?.replace('\\n', '')
    .trim()

  const [otherFeatures] = await page
    .$x('//*[@id="cr-summarization-attributes-list"]')
  const otherFeatureText = await otherFeatures?.getProperty('textContent')
  const otherFeatureJson = await otherFeatureText?.jsonValue()
  const finalOtherFeature = otherFeatureJson
    ?.replace('\\n', '')
    .trim()


  // Currently not interesting

  // const [available] = await page.$x('//*[@id="availability"]')
  // const availableText = await available?.getProperty('textContent')
  // const availableJson = await availableText?.jsonValue()
  // const finalAvailable = availableJson
    ?.replace('\\n', '')
    .trim()

  // const [stars] = await page.$x('//*[@id="averageCustomerReviews"]/span[1]')
  // const starsText = await stars?.getProperty('textContent')
  // const starsJson = await starsText?.jsonValue()
  // const finalStars = starsJson
    ?.replace('\\n', '')
    .trim()

  // const [rating] = await page.$x('//*[@id="acrCustomerReviewText"]')
  // const ratingText = await rating?.getProperty('textContent')
  // const ratingJson = await ratingText?.jsonValue()
  // const finalRating = ratingJson
    ?.replace('\\n', '')
    .trim()


  browser.close()

  const productDetails = {
    title: finalTitle,
    brand: finalMerchant,
    model: finalModelNumber,
    price: finalPrice,
    original_price: finalOriginalPrice,
    saving: finalSavingPrice,
    shipping_price: finalShippingPrice,
    image: imageSourceJson,
    delivery_date: finalDeliveryDate,
    // availability: finalAvailable,
    // rating: finalStars,
    // total_review_rating: finalRating,
    emi_details: finalEmiDetail,
    features: finalFeatures,
    description: finalDescription,
    asin: asinOrUrl,  // TODO: Extract ASIN from URL
    other_features: finalOtherFeature,
    website: url,
    type: 'TODO',
    location: 'TODO',
    // TODO: size:
    // TODO: weight:
    // TODO: color:
    // TODO: availability_since_date:
  }

  return productDetails
}


async function main () {
  const cliArgs = process.argv.slice(2)

  if (cliArgs.length === 0) {
    throw new Error(
      'Usage: node apps/_draft_things/crawl.js <asin or URL>',
    )
  }

  console.info(
    yaml.stringify(await crawl(cliArgs[0])),
  )
}


main()

