const crypto = require('crypto')
const querystring = require('querystring')
const request = require('request')
const env = require('./env')
const { toMoney } = require('./numbers')
const accountId = env('BITSTAMP_ACCOUNT_ID')
const apiKey = env('BITSTAMP_API_KEY')
const apiSecret = env('BITSTAMP_API_SECRET')
const currency = env('CURRENCY')
const min = env('CURRENCY_MIN')
const max = env('CURRENCY_MAX')
const argv = process.argv.slice(2)
const [ amountInUsdRaw ] = argv
const amountInUsd = parseFloat(amountInUsdRaw)
const currencyPair = `${ currency.toLowerCase() }usd`
const currencyUpper = currency.toUpperCase()

main().catch(bail)

async function main() {
  if (!amountInUsd) {
    return Promise.reject('Please indicate USD amount you want to spend: `node buy $AMOUNT`.')
  }

  const askingPrice = await getAskingPrice()
  const askingPriceMoney = toMoney(parseFloat(askingPrice))
  const amountInCrypto = Number.parseFloat((amountInUsd / askingPrice).toFixed(8))

  console.log(`Asking price is ${ askingPriceMoney }.`)
  console.log(`Will buy ${ amountInCrypto } ${ currencyUpper } (equivalent to ${ toMoney(amountInUsd) } at ${ askingPriceMoney } per 1 ${ currencyUpper }).`)

  await buyCurrency(amountInCrypto)

  console.log('Buy order complete.')
}

async function getAskingPrice() {
  const { status, body } = await r2({ url: `https://www.bitstamp.net/api/v2/ticker/${ currencyPair }/` })

  if (status !== 200) {
    return Promise.reject(`Failed to read asking price (${ currencyUpper }).`)
  }

  if (body.status === 'error') {
    return Promise.reject(`Failed to buy ${ currencyUpper }:\n${ JSON.stringify(body.reason, null, 2) }`)
  }

  const { ask } = body
  const askFloat = parseFloat(ask)
  const askMoney = toMoney(askFloat)

  if (askFloat < min) {
    return Promise.reject(`Asking price (${ currencyUpper }) is too low: ${ askMoney }.`)
  }

  if (askFloat > max) {
    return Promise.reject(`Asking price (${ currencyUpper }) is too high: ${ askMoney }.`)
  }

  return askFloat
}

async function buyCurrency(amount) {
  const nonce = new Date().valueOf()
  const signature = getSignature(nonce)
  const form = {
    key: apiKey,
    nonce,
    signature,
    amount
  }

  const url = `https://www.bitstamp.net/api/v2/buy/market/${ currencyPair }/`
  const { status, body } = await r2({
    method: 'POST',
    url,
    form
  })

  if (status !== 200) {
    return Promise.reject(`Failed to buy ${ currencyUpper }.`)
  }

  if (body.status === 'error') {
    return Promise.reject(`Failed to buy ${ currencyUpper }${ parseBitstampError(body.reason) }`)
  }
}

function parseBitstampError(reason) {
  const reasons = Object
    .keys(reason)
    .reduce((reasons, key) => [ ...reasons, ...reason[key] ], [])

  if (reasons.length === 0) {
    return ' (internal server error).'
  }

  return ':\n - ' + reasons.join('\n - ')
}

function getSignature(nonce) {
  const message = nonce + accountId + apiKey
  const hmac = crypto.createHmac('sha256', new Buffer(apiSecret, 'utf8'))
  const hash = hmac.update(message).digest('hex').toUpperCase()
  return hash
}

function r2(options) {
  return new Promise((resolve, reject) => {
    request({ json: true, ...options }, (error, response, body) => {
      if (error) {
        reject(error)
        return
      }

      resolve({ status: response.statusCode, body })
    })
  })
}

function bail(reason) {
  console.error(reason)
  process.exit(1)
}
