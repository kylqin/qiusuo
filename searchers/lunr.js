const lunr = require('lunr')
const Utils = require('../utils')

/**
 * 返回搜索结果
 * @parameter searchTerm 搜索字
 * @parameter list Array 要搜索的列表
 * @return Array [{ string, name, url }]
 */
exports.search = function (searchTerm, list) {
  const documents = list.map((el, idx) => {
    el.id = '' + idx
    el.oName = el.name.slice()
    el.name = el.name.replace(/\./g, ' ') // 以.链接的多个单词背当做一个单词了
    el.name = el.name.replace(/_/g, ' ') // 以_链接的多个单词背当做一个单词了
    return el
  })

  // console.log(documents.filter(doc => doc.name.match(/go/i)));

  const idx = lunr(function () {
    this.ref('id')
    this.field('name')
    this.metadataWhitelist = ['position']

    documents.forEach(function (doc) {
      this.add(doc)
    }, this)
  })

  const result = idx.search(searchTerm)

  // console.log(result);

  return result.map(el => {
    return {
      string: makeString(el, documents[el.ref]),
      name: documents[el.ref].oName,
      url: documents[el.ref].path
    }
  })
}

const options = {
  pre: Utils.color.NAME.Red,
  post: Utils.color.NAME.End,
}

function makeString (item, original) {
  const name = original.oName
  const md = item.matchData.metadata
  const positions = Object.keys(md).map(stem => {
    const ps = md[stem].name.position[0]
    return { start: ps[0], end: ps[0] + ps[1] }
  }).sort((a, b) => a.start - b.start)
  // console.log(name, '\npositions -> ', positions);

  const nameComponents = positions.reduce((acc, ps) => {
    acc.comps.push(name.slice(acc.lastEnd, ps.start))
    acc.comps.push(options.pre + name.slice(ps.start, ps.end) + options.post)
    acc.lastEnd = ps.end
    return acc
  }, { lastEnd: 0, comps: [] })
  // console.log('nameComponents -> ', nameComponents);
  nameComponents.comps.push(name.slice(nameComponents.lastEnd))

  const string = nameComponents.comps.join('')
  // console.log('string -> ', string);
  return string
}
