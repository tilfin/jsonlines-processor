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
exports.finalize = async (items) => {
  // sort
  return items.sort((a, b) => {
    return a - b
  })
}
```

### Run command

```
$ gunzip -c application-json.log.gz | jls proc.js > output_json.log
```
