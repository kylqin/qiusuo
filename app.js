const pjson = require('./package.json')
const MSG = require('./utils/msg')
const CONF = require('./config/conf')

const CmdTable = {
    '-h': showHelp,
    '--help': showHelp,
    '-v': showVersion,
    '--version': showVersion,

    default: showHelp
}

function runApp() {
    const A = parseArgs()
    const fn = CmdTable[A.cmd] || CmdTable.default

    fn(A.rest)
}

function parseArgs() {
    // command line args
    const cmd = process.argv[2]
    const args = process.argv.splice(3);
    const rest = args.join(' ') || ''

    return {
        cmd,
        rest
    }
}

function showHelp () {
    MSG.show(MSG.NAME.HELP, { userConfigFilePath: CONF.userConfigFilePath })
}

function showVersion () {
    MSG.show(MSG.NAME.VERSION, { version: pjson.version })
}

module.exports = {
  run: runApp
}