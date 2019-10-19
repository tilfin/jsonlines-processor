exports.process = async function (items) {
  items.forEach(it => this.push(it))
}
