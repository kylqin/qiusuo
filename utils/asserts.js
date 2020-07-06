const Utils = require('.')
const MSG = require('./msg')

/**
 * Check config location directory of a section
 */
function assertLocationDir (location, section) {
  if (!location) {
    MSG.show(MSG.NAME.UCONF_LOCATION_INVALID, { section })
    return false
  }
  if (!Utils.isDir(location)) {
    MSG.show(MSG.NAME.UCONF_LOCATION_NOT_EXIST, { section, location })
    return false
  }
  return true
}


/**
 * Check config collectFrom directories of a section
 */
function assertCollectFromDirs (collectFrom, section) {
  if (!collectFrom.length) {
    MSG.show(MSG.NAME.UCONF_COLLECTFROM_INVALID, { section })
    return false
  }

  for (const dir of collectFrom) {
    if (!Utils.isDir(dir)) {
      MSG.show(MSG.NAME.UCONF_COLLECTFROM_NOT_EXIST, { collectFrom: dir, section })
      return false
    }
  }
  return true
}

module.exports = {
  assertLocationDir,
  assertCollectFromDirs
}