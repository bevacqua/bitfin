const crypto = require('crypto')
const querystring = require('querystring')
const request = require('request')
const env = require('./env')
const { toMoney } = require('./numbers')
const accountId = env('BITSTAMP_ACCOUNT_ID')
const apiKey = env('BITSTAMP_API_KEY')
const apiSecret = env('BITSTAMP_API_SECRET')
const source = env('FROM')
const target = env('TO')
const min = env('MIN')
const max = env('MAX')
const argv = process.argv.slice(2)
const [ sourceAmountRaw ] = argv
const sourceAmount = parseFloat(sourceAmountRaw)
const marketPair = `${ target.toLowerCase() }${ source.toLowerCase() }`
const targetUpper = target.toUpperCase()
const sourceUpper = source.toUpperCase()

main().catch(bail)

async function main() {
  if (!accountId) {
    return Promise.reject(`Please enter your Bitstamp account ID.`)
  }

  if (!apiKey) {
    return Promise.reject(`Please enter your Bitstamp API key.`)
  }

  if (!apiSecret) {
    return Promise.reject(`Please enter your Bitstamp API secret.`)
  }

  if (!sourceAmount) {
    return Promise.reject(`Please indicate ${ targetUpper } amount you want to spend: \`node buy $AMOUNT\`.`)
  }

  const askingPrice = await getAskingPrice()
  const askingPriceMoney = toMoney(parseFloat(askingPrice), { currency: sourceUpper })
  const amountInTarget = Number.parseFloat((sourceAmount / askingPrice).toFixed(8))
  const amountInTargetMoney = toMoney(amountInTarget, { currency: targetUpper, precision: 8 })

  console.log(`Asking price is ${ askingPriceMoney }.`)
  console.log(`Will buy ${ amountInTargetMoney } (equivalent to ${ toMoney(sourceAmount, { currency: sourceUpper }) } at ${ askingPriceMoney } per ${ toMoney(1, { currency: targetUpper }) }).`)

  await buyCurrency(amountInTarget)

  console.log('Buy order complete.')
}

async function getAskingPrice() {
  const { status, body } = await r2({ url: `https://www.bitstamp.net/api/v2/ticker/${ marketPair }/` })

  if (status !== 200) {
    return Promise.reject(`Failed to read asking price (${ targetUpper }).`)
  }

  if (body.status === 'error') {
    return Promise.reject(`Failed to buy ${ targetUpper }:\n${ JSON.stringify(body.reason, null, 2) }`)
  }

  const { ask } = body
  const askFloat = parseFloat(ask)
  const askMoney = toMoney(askFloat, { currency: sourceUpper })

  if (askFloat < min) {
    return Promise.reject(`Asking price (${ targetUpper }) is too low: ${ askMoney }.`)
  }

  if (askFloat > max) {
    return Promise.reject(`Asking price (${ targetUpper }) is too high: ${ askMoney }.`)
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

  const url = `https://www.bitstamp.net/api/v2/buy/market/${ marketPair }/`
  const { status, body } = await r2({
    method: 'POST',
    url,
    form
  })

  if (status !== 200) {
    return Promise.reject(`Failed to buy ${ targetUpper }.`)
  }

  if (body.status === 'error') {
    return Promise.reject(`Failed to buy ${ targetUpper }${ parseBitstampError(body.reason) }`)
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
