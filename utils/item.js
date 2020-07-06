const path = require('path')
const Utils = require('.')

const isSectionItem = section => fileName => {
  const extensions = Utils.ensureArray(section.fileExtensions)
  if (extensions.length === 0) {
    return true
  }
  const ext = path.extname(fileName).replace(/\./, '')
  return extensions.indexOf(ext) !== -1
}

module.exports = {
  isSectionItem
}