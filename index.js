#! /usr/bin/env node

const path = require('path')
const { Transform } = require('stream')
const PromisedLife = require('promised-lifestream')
const Helper = require('./lib/helper')
const transformers = require('./lib/transformers')

let logic = null;
if (process.argv.length > 2) {
  const procScriptPath = process.argv[2]
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

const argv = process.argv.slice(3)

if (!logic) {
  console.info('Usage) jlp <logic.js> < STDIN > STDOUT')
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

const { proc, finalize, before, after } = (() => {
  if (typeof logic === 'object') {
    return {
      proc: logic.process,
      finalize: logic.finalize,
      before: logic.before || function() {
        return Promise.resolve()
      },
      after: logic.after || function() {
        return Promise.resolve()
      }
    }
  } else {
    // for v0.1.1 or earlier
    return {
      proc: logic,
      finalize: null,
      before: function() {
        return Promise.resolve()
      },
      after: function() {
        return Promise.resolve()
      }
    }
  }
})()


function convertItemToStr(item) {
  if (typeof item === 'string') {
    return item + "\n"
  } else {
    return JSON.stringify(item) + "\n"
  }
}

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
  new Helper(before).execute(...argv)
  .then(() => {
    return PromisedLife(streams, { needResult: true })
  })
  .then(result => {
    const finalizer = new Helper(finalize)
    return finalizer.execute(result)
  })
  .then(result => {
    const results = [].concat(result)
    for (let item of results) {
      if (item == null) continue

      try {
        process.stdout.write(convertItemToStr(item))
      } catch(e) {
        throw e
      }
    }
  })
  .then(() => {
    return new Helper(after).execute(...argv)
  })
  .catch(err => {
    process.stderr.write(err.toString())
  })
} else {
  const JsonizeTransform = new Transform({
    objectMode: true,
    transform(item, _, cb) {
      if (item == null) {
        cb(null);
        return
      }

      try {
        cb(null, convertItemToStr(item))
      } catch(e) {
        cb(e)
      }
    }
  })
  streams.push(JsonizeTransform)
  streams.push(process.stdout)

  new Helper(before).execute(...argv)
  .then(() => {
    return PromisedLife(streams)
  })
  .then(() => {
    return new Helper(after).execute(...argv)
  })
  .catch(err => {
    process.stderr.write(err.toString())
  })
}
