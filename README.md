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
exports.process = async function(item) {
  // filter
  if (item.target === 'my_require') {
    return item;
  }
}

// Optional
exports.finalize = async function(items) {
  // sort
  return this.sort(items, 'age')
}

exports.before = async function(cliArg1, cliArg2) {
  // const anotherLogs = await this.readJSONLinesFile('./another.log')
  // const userMap = this.keyBy(anotherLogs, 'user.name')
  // await startServer()
}

exports.after = async function(items) {
  // await shutdownServer()
}
```

### Run command

```
$ gunzip -c application-json.log.gz | jlp logic.js > output_json.log
```

## Helper function

Following utility methods can be called in `process`, `finalize`, `before` or `after` functions

### sort(items, [key], [direct])

#### Arguments

* `items:Array` - The array to process
* `[key]:String` - Target field name. item itself if not specified
* `[direct]:String` - Ascending if not specified, else descending

#### Returns

* `Array` - the new array of sorted items

### keyBy(items, key)

#### Arguments

* `items:Array` - The array to process
* `key:String` - The iteratee to transform key

#### Returns

* `Object` - the composed aggregate object.

### sum(items, [key])

#### Arguments

* `items:Array` - The array to process
* `[key]:String` - Target field name. item itself if not specified

#### Returns

* `Number` - the total value for each items

### readJSONLinesFile(fileName)

#### Arguments

* `fileName:String` - JSON Lines file path

#### Returns

* `Array` - the new array of JSON object

### readTSVFile(fileName)

#### Arguments

* `fileName:String` - TSV file path

#### Returns

* `Array` - Returns the new array of array item

## Examples

#### example-json.log

```json
{"name":"Hanako","age":16,"score":41}
{"name":"Taro","age":18,"score":81}
{"name":"Mike","age":15,"score":72}
{"name":"Ken","age":17,"score":90}
```

#### logic1.js

Extracting the name and score of only item whose age is greater than 16, and sorting items by their score in descending order

```js
exports.process = async ({ name, age, score }) => {
  if (age > 16) {
    return { name, score }
  }
}

exports.finalize = async function(items) {
  return this.sort(items, 'score', 'desc')
}
```

#### Result

```
$ jlp logic1.js < example-json.log
{"name":"Ken",score:90}
{"name":"Taro",score:81}
```

## License

  [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/jsonlines-processor.svg
[npm-url]: https://npmjs.org/package/jsonlines-processor
