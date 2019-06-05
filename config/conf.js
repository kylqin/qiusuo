const fs = require('fs')
const os = require('os')
const MSG = require('../utils/msg')

const homeDir = os.homedir()
const userConfigFilePath = `${homeDir}/.qsconf.json`
let config
try {
  const configStr = fs.readFileSync(userConfigFilePath)
  config = configStr && JSON.parse(configStr)
  config.userConfigFilePath = userConfigFilePath
  config.homeDir = homeDir
} catch (e) {
  MSG.show(MSG.NAME.UCONF_INVALID, { userConfigFilePath })

  // Exit directly
  process.exit(1)
}

if (config) {
  module.exports = config
}
