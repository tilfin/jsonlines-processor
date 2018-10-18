exports.process = async (item) => {
  // filter
  if (item.foo > 3) return item
}

// Optional
exports.finalize = async function(items) {
  return this.sortBy(items, 'bar.time')
}

exports.before = async function() {
  const rs = await this.readJSONLogFile('./sample.log')
  const rsByColor = this.keyBy(rs, 'bar.color')
  console.log('before', rsByColor)
}

exports.after = async function() {
  console.log('after')
}
