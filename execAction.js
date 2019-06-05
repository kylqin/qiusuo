const path = require('path')
const CONF = require('./config/conf')
const Utils = require('./utils')
const MSG = require('./utils/msg')

const sSimple = require('./searchers/simple')
const sLunr = require('./searchers/lunr')

const uiBlessed = require('./ui/blessed')

function execAction(name, rest) {
    const section = CONF[name]

    const extensions = Utils.ensureArray(section.fileExtensions)
    const ignoreDirs = Utils.ensureArray(section.ignoreDirs)

    const isItem = fileName => {
        if (extensions.length === 0) {
            return true
        }
        const ext = path.extname(fileName).replace(/\./, '')
        return extensions.indexOf(ext) !== -1
    }

    const list = createList(name, isItem, ignoreDirs)
    const searchTerm = rest.join(' ')
    const filteredLunr = sLunr.search(searchTerm, list)
    const filteredSimple = sSimple.search(searchTerm, list)
    const filtered = mergeResult(filteredLunr, filteredSimple)

    uiBlessed.p(filtered)
}


/**
 * Create the list to search from
 */
function createList (name, isItem, ignoreDirs) {
    const section = CONF[name]
    const list = []
    const location = section.location

    checkLocation(name) || process.exit(1)

    try {
        Utils.recdir(location, ignoreDirs, function (fileName) {
            if (isItem(fileName)) {
                list.push({
                    name: path.basename(fileName),
                    path: fileName
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


/**
 * Check config location directory of section named name
 * @param {String} name Name of section
 */
function checkLocation(name) {
    const section = CONF[name]
    if (!section.location) {
        MSG.show(MSG.NAME.UCONF_LOCATION_INVALID, {
            section: name,
            userConfigFilePath: section.userConfigFilePath
        })
        return false
    }
    if (!Utils.isDir(section.location)) {
        MSG.show(MSG.NAME.UCONF_LOCATION_NOT_EXIST, {
            section: name,
            location: section.location,
            userConfigFilePath: section.userConfigFilePath
        })
        return false
    }
    return true
}

/**
 * Check config collectFrom directories of section named name
 * @param {String} name Name of section
 */
function checkCollectFrom(name) {
    const section = CONF[name]
    if (!section.collectFrom || !(section.collectFrom instanceof Array)) {
        MSG.show(MSG.NAME.UCONF_COLLECTFROM_INVALID, {
            section: name,
            userConfigFilePath: section.userConfigFilePath
        })
        return false
    }

    const cf = section.collectFrom
    for (let i = 0; i < cf.length; i += 1) {
        if (!Utils.isDir(cf[i])) {
            MSG.show(MSG.NAME.UCONF_COLLECTFROM_NOT_EXIST, {
                section: name,
                collectFrom: cf[i],
                userConfigFilePath: section.userConfigFilePath
            })
            return false
        }
    }
    return true
}

module.exports = execAction
