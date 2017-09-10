const nconf = require('nconf')

nconf.use('memory')
nconf.argv()
nconf.env()

nconf.file('local',    '.env.json')
nconf.file('defaults', '.env.defaults.json')

if (module.parent) {
  module.exports = accessor
} else {
  print()
}

function accessor(key, value) {
  if (arguments.length === 2) {
    return nconf.set(key, value)
  }
  return nconf.get(key)
}

function print() {
  const argv = process.argv
  const prop = argv.length > 2 ? argv.pop() : false
  const unsafeConf = prop ? accessor(prop) : accessor()
  const conf = unsafeConf || {}

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(conf, null, 2))
}
