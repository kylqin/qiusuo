const Utils = require('../utils')

const options = {
  pre: Utils.color.NAME.Red,
  post: Utils.color.NAME.End,
  extract: el => el.name
}

/**
  * 返回搜索结果
  * @parameter searchTerm 搜索字
  * @parameter list Array 要搜索的列表
  * @return Array [{ string, name, url }]
  */
exports.search = function (searchTerm, list) {
  const result = []
  for (const el of list) {
    const m = match(options.extract(el), searchTerm)
    if (m) {
      result.push({
        string: m,
        name: el.name,
        url: el.path
      })
    }
  }

  return result
}

function match (string, term) {
  const matches = string.toLowerCase().match(term.toLowerCase())
  if (matches) {
    return string.slice(0, matches.index) + options.pre +
      string.slice(matches.index, matches.index + term.length) +
      options.post + string.slice(matches.index + term.length)
  }
  return null
}
