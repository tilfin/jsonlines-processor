# json-log-stream

JSON log stream processor

A JSON log is called newline-delimited JSON and used for structured logs.

## Install

```
$ npm install -g json-log-stream
```

## How to Use

### Create proc.js

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

exports.before = async function(items) {
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
