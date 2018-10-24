# jsonlines-processor

[![NPM Version][npm-image]][npm-url]
[![Build Status](https://travis-ci.org/tilfin/jsonlines-processor.svg?branch=master)](https://travis-ci.org/tilfin/jsonlines-processor)

JSON Lines streaming processor for CLI

A JSON Lines is called newline-delimited JSON and used for structured logs.

## Install

```
$ npm install -g jsonlines-processor
```

## How to Use

### Create logic.js

```js
exports.process = async (item) => {
  // filter
  if (item.target === 'my_require') {
    return item;
  }
}

// Optional
exports.finalize = async function(items) {
  // sort
  return this.sortBy(items, 'age')
}

exports.before = async function(cliArg1, cliArg2) {
  // const anotherLogs = await this.readJSONLogFile('./another.log')
  // const userMap = this.keyBy(anotherLogs, 'user.name')
  // await startServer()
}

exports.after = async function(items) {
  // await shutdownServer()
}
```

### Run command

```
$ gunzip -c application-json.log.gz | jls proc.js > output_json.log
```

## License

  [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/jsonlines-processor.svg
[npm-url]: https://npmjs.org/package/jsonlines-processor
