const Utils = require('./index')

const { red, green } = Utils.color

const MSG = {
  USER_CONF_INVALID: (args) => `Please modify the configuration file \`${red(args.userConfigFilePath)}\`(created it if not existed).`,

  HELP: (args) => `Usage: qs {-h | --help | -v | --version}
       qs <subCommand> <restArgs>

Options:
   --help, -h      Show this infomation
   --version, -v   Show version

These are common sub commands used to search information:

   book       Search books

Please modify the configuration file \`${args.userConfigFilePath}\` (created it if not
existed), assigning the field \`booksdir\` the path where your books located.
`,

  VERSION: (args) => `v${args.version}`
}

const NAME = Object.keys(MSG).reduce((acc, key) => ({ ...acc, [key]: key }), {})

module.exports = {
  show: (name, args) => {
    console.log(MSG[name](args))
  },
  NAME
}