const fs = require('fs')
const PromisedLife = require('promised-lifestream')
const transformers = require('./transformers')

class Helper {
  constructor(func) {
    this._func = func
  }

  execute(arg) {
    return this._func(arg)
  }

  sortBy(items, key, direct) {
    const keyChain = key.split('.')
    const lessThan = direct === 'desc' ? 1 : -1
    return items.sort((a, b) => {
      let av = a, bv = b
      for (let key of keyChain) {
        av = av[key]
        bv = bv[key]
      }
      if (av < bv) return lessThan
      if (av > bv) return -lessThan
      return 0
    })
  }

  keyBy(items, key) {
    const hash = {}
    const keyChain = key.split('.')
    for (let item of items) {
      let kv = item
      for (let key of keyChain) {
        kv = kv[key]
      }
      hash[kv] = item
    }
    return hash
  }

  readJSONLogFile(fileName) {
    return PromisedLife([
      fs.createReadStream(fileName),
      transformers.createReadline(),
      transformers.createJSONParser(),
    ], { needResult: true })
  }
}

module.exports = Helper
