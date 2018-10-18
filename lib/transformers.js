const { Transform } = require('stream')
const ReadlineTransform = require('readline-transform')

exports.createReadline = function() {
  return new ReadlineTransform({ skipEmpty: true })
}

exports.createJSONParser = function() {
  return new Transform({
    objectMode: true,
    transform(line, _, cb) {
      try {
        const item = JSON.parse(line)
        cb(null, item)
      } catch(e) {
        cb(e)
      }
    }
  })
}
