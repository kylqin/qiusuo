const fs = require('fs')
const path = require('path')
const CONF = require('./config/conf')
const Utils = require('./utils')
const ItemUtils = require('./utils/item')
const AssertUtils = require('./utils/asserts')
const MSG = require('./utils/msg')

const { COPYFILE_EXCL } = fs.constants

function execCollect(sectionName, args) {
  const dryRun = args.includes('--dry-run')

  const section = CONF[sectionName]
  const collectFrom = Utils.ensureArray(section.collectFrom)
  const ignoreDirs = Utils.ensureArray(section.ignoreDirs)

  AssertUtils.assertLocationDir(section.location, section) || process.exit(1)
  AssertUtils.assertCollectFromDirs(collectFrom, section) || process.exit(1)

  const isItem = ItemUtils.isSectionItem(section)

  try {
    for (const cLoc of collectFrom) {
      Utils.recdir(cLoc, ignoreDirs, function (filePath) {
        if (isItem(filePath)) {
          try {
            // console.log('dest ', path.join(section.location, path.basename(filePath)))
            if (!dryRun) {
              fs.copyFileSync(filePath, path.join(section.location, path.basename(filePath)), COPYFILE_EXCL)
              child_process.execSync(`rm "${filePath}"`)
            }
          } catch (e) {
            // console.log(e)
            MSG.show(MSG.NAME.INFO_MOVE_FILE_FAIL, {
              filePath,
              reason: e.code
            })
            return
          }
          // child_process.execSync(`yes n |mv -i "${fileName}" "${booksdir}"`)
          MSG.show(MSG.NAME.INFO_MOVE_FILE_SUCCESS, {
            filePath
          })
        }
      })
    }
  } catch (e) {
    console.log(e)
    // Exit directly
    process.exit(1)
  }
}

module.exports = execCollect