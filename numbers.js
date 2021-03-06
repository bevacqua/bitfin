'use strict'

function flip(text) {
  return text.split('').reverse().join('')
}

function toMoney(value, { precision = 2, currency = '$' } = {}) {
  const fixed = value.toFixed(precision)
  const [ integer, decimal ] = fixed.split('.')

  if (integer.startsWith('-')) {
    return `-${ moneyFormat(integer.slice(1)) }`
  }
  return moneyFormat(integer)

  function moneyFormat(integerPart) {
    return `${ prettyInt(integerPart) }.${ decimal } ${ currency }`
  }
}

function prettyInt(value) {
  const valueString = value.toString()
  const negative = valueString.startsWith('-')
  const absolute = negative ? valueString.slice(1) : valueString
  const sign = negative ? '-' : ''
  const rsplitter = /.{1,3}/g
  const bits = flip(flip(absolute).match(rsplitter).join(','))
  return `${ sign }${ bits }`
}

module.exports = { toMoney, prettyInt }
