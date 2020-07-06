const pjson = require('./package.json')
const MSG = require('./utils/msg')
const CONF = require('./config/conf')
const execSearch = require('./execSearch')
const execCollect = require('./execCollect')

const CmdTable = {
    '-h': showHelp,
    '--help': showHelp,
    '-v': showVersion,
    '--version': showVersion,
    '-c': showConf,
    '--conf': showConf,

    // '-s': execAction,

    default: showHelp
}

const SubCmdTable = {
    'search': execSearch,
    's': execSearch,
    'collect': execCollect,
    'c': execCollect,
}

function runApp() {
    const A = parseArgs()
    if (A.cmd && A.cmd.startsWith('-s')) {
        return execAction(A.rest[0], A.rest.slice(1))
    }
    const fn = CmdTable[A.cmd] || CmdTable.default

    fn(A.rest)
}

function parseArgs(_argv) {
    // command line args
    let argv = _argv
    if (!_argv) {
        argv = process.argv.slice(2)
    }
    let cmd = argv[0]
    const rest =argv.slice(1)

    if (cmd && cmd.startsWith('--section=')) {
        rest.unshift(cmd.split('=')[1])
        cmd = '-s'
    }

    return {
        cmd,
        rest
    }
}

function execAction(section, argv) {
    const { cmd, rest } = parseArgs(argv)
    // console.log('execAction ->', section, cmd, rest)
    if (CONF[section]) {
        return SubCmdTable[cmd](section, rest)
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