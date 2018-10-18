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

  sortBy(items, key) {
    return items.sort((a, b) => {
      if (a[key] < b[key]) return -1
      if (a[key] > b[key]) return 1
      return 0
    })
  }

  sortByDesc(items, key) {
    return items.sort((a, b) => {
      if (a[key] < b[key]) return 1
      if (a[key] > b[key]) return -1
      return 0
    })
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
