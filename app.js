const pjson = require('./package.json')
const MSG = require('./utils/msg')
const CONF = require('./config/conf')
const execA = require('./execAction')

const CmdTable = {
    '-h': showHelp,
    '--help': showHelp,
    '-v': showVersion,
    '--version': showVersion,
    '-c': showConf,
    '--conf': showConf,
    'e': execAction,
    'exec': execAction,

    default: showHelp
}

function runApp() {
    const A = parseArgs()
    const fn = CmdTable[A.cmd] || CmdTable.default

    fn(A.rest)
}

function parseArgs(_argv) {
    // command line args
    let argv = _argv
    if (!_argv) {
        argv = process.argv.slice(2)
    }
    const cmd = argv[0]
    const rest =argv.slice(1)

    return {
        cmd,
        rest
    }
}

function execAction(argv) {
    const { cmd, rest } = parseArgs(argv)
    if (CONF[cmd]) {
        return execA(cmd, rest)
    }
    return showHelp()
}

function showHelp() {
    MSG.show(MSG.NAME.HELP, {
        userConfigFilePath: CONF.userConfigFilePath
    })
}

function showVersion() {
    MSG.show(MSG.NAME.VERSION, {
        version: pjson.version
    })
}

function showConf() {
    // MSG.show(MSG.NAME.VERSION, { version: pjson.version })
    console.log(JSON.stringify(CONF, null, 2))
}

module.exports = {
    run: runApp
}