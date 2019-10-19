class ProcessWrapper {
  constructor(proc) {
    this._proc = proc
    this._results = []
  }

  execute(item) {
    return this._proc(item)
      .then(result => {
        if (result !== undefined) {
          this._results.push(result)
        }
        const r = this._results
        this._results = []
        return r
      })
  }

  push(item) {
    this._results.push(item)
  }
}

module.exports = ProcessWrapper
