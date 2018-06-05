#! /usr/bin/env node

const path = require('path')
const stream = require('stream')
const es = require('event-stream')
const PromisedLife = require('promised-lifestream')
const ReadlineTransform = require('readline-transform')

let proc = null;
if (process.argv.length !== 2) {
  const procScriptPath = process.argv.pop()
  try {
    const relPath = path.resolve(process.cwd(), procScriptPath)
    proc = require(relPath)
  } catch(e) {
    console.error(`Failed to load ${relPath}`)
    process.exit(1)
  }
}

if (!proc) {
  console.info('Usage) json-log-stream <proc.js> < STDIN > STDOUT')
  console.info(`
proc.js example
---------------

module.exports = async (item) => {
  // filter
  if (item.target === 'my_require') {
    return item;
  }
}
`)
  process.exit(2)
}

PromisedLife([
  process.stdin,
  new ReadlineTransform({ skipEmpty: true }),
  es.map(function (line, cb) {
    try {
      const item = JSON.parse(line)
      cb(null, item)
    } catch(e) {
      cb(e)
    }
  }),
  es.map(function (item, cb) {
    proc(item).then(result => cb(null, result)).catch(cb)
  }),
  es.map(function (result, cb) {
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
  }),
  process.stdout
]).catch(err => {
  process.stderr.write(err.toString())
})
