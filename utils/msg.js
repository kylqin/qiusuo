const Utils = require('./index')

const {
    red,
    green
} = Utils.color

const MSG = {
    // help
    HELP: (args) => `Usage: qs {-h | --help | -v | --version}
       qs <subCommand> <restArgs>

Options:
   --help, -h      Show this infomation
   --version, -v   Show version
   --conf, -c      Show configuration

These are common sub commands used to search information:

   exec, e <section>  Search documents with types and location configured in section <section>

Please modify the configuration file \`${args.userConfigFilePath}\` (created it if not existed).
`,

    // version
    VERSION: (args) => `v${args.version}`,

    // user config invalid
    UCONF_INVALID: (args) => `Please modify the configuration file \`${red(args.userConfigFilePath)}\`(created it if not existed).`,

    // user config location invalid
    UCONF_LOCATION_INVALID: args => `Location path invalid for section ${args.section}.`,

    // user config location dose not exist
    UCONF_LOCATION_NOT_EXIST: args => `Location path dose not exist for section ${args.section}, location: ${args.location}`,

    // user config location invalid
    UCONF_COLLECTFROM_INVALID: args => `CollectFrom paths invalid for section ${args.section}.`,

    // user config location dose not exist
    UCONF_COLLECTFROM_NOT_EXIST: args => `CollectFrom path dose not exist for section ${args.section}, location: ${args.collectFrom}`,
}

const NAME = Object.keys(MSG).reduce((acc, key) => ({
    ...acc,
    [key]: key
}), {})

module.exports = {
    show: (name, args) => {
        console.log(MSG[name](args))
    },
    NAME
}