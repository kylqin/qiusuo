const path = require('path')
const CONF = require('./config/conf')
const Utils = require('./utils')
const ItemUtils = require('./utils/item')
const AssertUtils = require('./utils/asserts')
const MSG = require('./utils/msg')

const sSimple = require('./searchers/simple')
const sLunr = require('./searchers/lunr')

const uiBlessed = require('./ui/blessed')

function execSearch(sectionName, rest, createUI = true) {
    const section = CONF[sectionName]

    const extensions = Utils.ensureArray(section.fileExtensions)
    const ignoreDirs = Utils.ensureArray(section.ignoreDirs)

    const isItem = ItemUtils.isSectionItem(section)

    const list = createList(sectionName, isItem, ignoreDirs)
    const searchTerm = rest.join(' ')
    const filteredLunr = sLunr.search(searchTerm, list)
    const filteredSimple = sSimple.search(searchTerm, list)
    const filtered = mergeResult(filteredLunr, filteredSimple)

    if (createUI) {
        uiBlessed.p(filtered, searchTerm, (st, receiveResult) => {
            const filtered = execSearch(sectionName, [st], false) // Do not re-create UI, just re-render it
            receiveResult(filtered)
        })
    }
    return filtered
}


/**
 * Create the list to search from
 */
function createList (sectionName, isItem, ignoreDirs) {
    const section = CONF[sectionName]
    const list = []
    const location = section.location

    AssertUtils.assertLocationDir(section.location, section) || process.exit(1)

    try {
        Utils.recdir(location, ignoreDirs, function (filePath) {
            if (isItem(filePath)) {
                list.push({
                    name: path.basename(filePath),
                    path: filePath
                })
            }
        })
    } catch (e) {
        console.log(e)
        // Exit directly
        process.exit(1)
    }

    return list
}

/**
 * Merge the tow array, excluding the duplicated
 * @param {Array} listA
 * @param {Array} listB
 */
function mergeResult (listA, listB) {
  const existsInA = {}
  for (let e of listA) {
    existsInA[e.url] = true
  }
  const result = listA.slice()
  for (let e of listB) {
    if (!existsInA[e.url]) {
      result.push(e)
    }
  }
  return result
}

module.exports = execSearch
