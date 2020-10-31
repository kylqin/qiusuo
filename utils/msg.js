const Utils = require('./index')

const {
    red,
    green
} = Utils.color

const MSG = {
    // help
    HELP: (args) => `Usage: qs {-h | --help | -v | --version}
       qs --section=<sectionName> <subCommand> <restArgs>

Options:
   --help, -h      Show this infomation
   --version, -v   Show version
   --conf, -c      Show configuration
   --section=<sectionName>, -s   Sub commnand will execute with this argument, it is required

These are common sub commands used to search information:

   search, s       Search documents with types and location configured in section <section>
   collect, c      Collect files from \`collectFrom\` directories
   collect --dry-run, c --dry-run

Please modify the configuration file \`${args.userConfigFilePath}\` (created it if not existed).

Examples:
qs -s books s 金庸                     # search books
qs --section=notes search mathematic   # search notes
qs -s books collect                    # collect downloaded books to your target directory

A \`~/.qsconf.json\` Exmaple:
{
    "books": {
        "name": "books",
        "alias": "bk",
        "location": "/Users/kylqin/books",
        "fileExtensions": ["epub", "pdf", "mobi"],
        "collectFrom": ["/Users/kylqin/Downloads"]
    },
    "notes": {
        "name": "notes",
        "alias": "nt",
        "location": "/Users/kylqin/Documents/notes.d",
        "ignoreDirs": [".git"],
        "fileExtensions": ["md", "html", "xlsx"],
        "collectFrom": ["/Users/kylqin/Downloads"]
    }
}
`,

    // version
    VERSION: (args) => `v${args.version}`,

    // user config is invalid
    UCONF_INVALID: (args) => `Please modify the configuration file \`${red(args.userConfigFilePath)}\`(created it if not existed).`,

    // user config location is invalid
    UCONF_LOCATION_INVALID: args => `Location path is invalid for section ${args.section}.`,

    // user config location dose not exist
    UCONF_LOCATION_NOT_EXIST: args => `Location path dose not exist for section ${args.section}, location: ${args.location}`,

    // user config location is invalid
    UCONF_COLLECTFROM_INVALID: args => `CollectFrom paths is invalid for section ${args.section}.`,

    // user config location dose not exist
    UCONF_COLLECTFROM_NOT_EXIST: args => `CollectFrom path dose not exist for section ${args.section}, location: ${args.collectFrom}`,

    INFO_MOVE_FILE_FAIL: args => ` ${red('✘')} ${args.filePath}` + (args.reason ? ` [${red(args.reason)}]` : ''),

    INFO_MOVE_FILE_SUCCESS: args => ` ${green('✔')} ${args.filePath}`,
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