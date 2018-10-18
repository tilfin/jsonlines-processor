#! /usr/bin/env node

const path = require('path')
const { Transform } = require('stream')
const PromisedLife = require('promised-lifestream')
const Helper = require('./lib/helper')
const transformers = require('./lib/transformers')

let logic = null;
if (process.argv.length !== 2) {
  const procScriptPath = process.argv.pop()
  let relPath
  try {
    relPath = path.resolve(process.cwd(), procScriptPath)
    logic = require(relPath)
  } catch(e) {
    console.error(`Failed to load ${relPath}`)
    console.error(e)
    process.exit(1)
  }
}

if (!logic) {
  console.info('Usage) json-log-stream <logic.js> < STDIN > STDOUT')
  console.info(`
logic.js example
---------------

exports.process = async (item) => {
  // filter
  if (item.target === 'my_require') {
    return item;
  }
}

// Optional
exports.finalize = async (items) => {
  // sort
  return items.sort((a, b) => {
    return a - b
  })
}
`)
  process.exit(2)
}

const { proc, finalize } = (() => {
  if (typeof logic === 'object') {
    return {
      proc: logic.process,
      finalize: logic.finalize
    }
  } else {
    // for v0.1.1 or earlier
    return {
      proc: logic,
      finalize: null
    }
  }
})()


const JsonizeTransform = new Transform({
  objectMode: true,
  transform(result, _, cb) {
    if (result == null) {
      cb(null);
      return;
    }

    try {
      if (typeof result === 'string') {
        cb(null, result + "\n")
      } else {
        cb(null, JSON.stringify(result) + "\n")
      }
    } catch(e) {
      cb(e)
    }
  }
})

const streams = [
  process.stdin,
  transformers.createReadline(),
  transformers.createJSONParser(),
  new Transform({
    objectMode: true,
    transform(item, _, cb) {
      proc(item).then(result => cb(null, result)).catch(cb)
    }
  })
]

if (finalize) {
  PromisedLife(streams, { needResult: true })
  .then(result => {
    const finalizer = new Helper(finalize)
    return finalizer.execute(result)
  })
  .then(result => {
    const results = [].concat(result)
    return new Promise((resolve, reject) => {
      for (const item of results) {
        JsonizeTransform._transform(item, null, (err, str) => {
          if (err) reject(err)
          else if (str) process.stdout.write(str)
        })
      }
    })
  })
  .catch(err => {
    process.stderr.write(err.toString())
  })
} else {
  streams.push(JsonizeTransform)
  streams.push(process.stdout)

  PromisedLife(streams)
  .catch(err => {
    process.stderr.write(err.toString())
  })
}
