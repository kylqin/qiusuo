const fs = require('fs')
const path = require('path')

/**
 * Run action for directory and it's children directories recursively
 */
function recdir(pathDir, ignoreDirs, action) {
    const stats = fs.statSync(pathDir)
    if (stats.isDirectory()) {
        const contents = fs.readdirSync(pathDir)
        for (const c of contents) {
            ignoreDirs.indexOf(c) === -1 && recdir(path.join(pathDir, c), ignoreDirs, action)
        }
    } else {
        action(pathDir)
    }
}

// see: https://misc.flogisoft.com/bash/tip_colors_and_formatting
const CL = {
    Red: '\x1b[31m',
    Green: '\x1b[32m',
    Blue: '\x1b[34m',
    Darkgray: '\x1b[90m',
    _Lightblue: '\x1b[104m',
    End: '\x1b[0m',
}

const gc = cl => str => `${cl}${str}${CL.End}`

module.exports = {
    isDir: function isDir(p) {
        if (!fs.existsSync(p)) {
            return false
        }
        if (!fs.statSync(p).isDirectory()) {
            return false
        }
        return true
    },

    recdir,

    ensureArray: a => a instanceof Array ? a : [],

    color: {
        NAME: CL,
        red: gc(CL.Red),
        green: gc(CL.Green),
        blue: gc(CL.Blue),
        darkgray: gc(CL.Darkgray),
        _lightblue: gc(CL._Lightblue),
    },
}
