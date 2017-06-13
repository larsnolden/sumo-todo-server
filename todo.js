//Todo constructor
module.exports = function Todo(title = '', id, done = false) {
  this.title = title,
    this.id = id,
    this.done = done
}