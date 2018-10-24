exports.process = async (item) => {
  // filter
  if (item.foo > 3) return item
}

// Optional
exports.finalize = async function(items) {
  const sum1 = this.sum(items, 'foo')
  const sum2 = this.sum([1, 2, 3])
  return this.sort(items, 'bar.time').concat(sum1, sum2)
}

exports.before = async function(tsvFile) {
  const tsv = await this.readTSVFile(tsvFile)
  const rs = await this.readJSONLinesFile('./sample.log')
  const rsByColor = this.keyBy(rs, 'bar.color')
  console.log('before', tsv, rsByColor)
}

exports.after = async function() {
  console.log('after')
}
