const fs = require('fs')
const path = require('path')

/*
 * Padding string `length` with char `padWithChar` on left/right side to fit length `length`.
 * @length Number
 * @content except String, or Nubmer
 * @padWithChar Char
 * @return String
 * Examples:
 *   pad(4, 'ho', '-')  => '--ho'
 *   pad('ho', 4, '-')  => 'ho--'
 *   pad('hoo', 2, '-') => 'hoo'
 */
const pad = (length, content, padWithChar = ' ') => {
    let len = length
    let ctt = String(content)
    let left = true
    let padWithStr = ''

    if (typeof length !== 'number') {
        len = content
        ctt = String(length)
        left = false
    }

    if (ctt.length >= len) {
        return ctt
    }

    for (let i = ctt.length; i < len; ++i) {
        padWithStr += padWithChar
    }

    return left ? `${padWithStr}${ctt}` : `${ctt}${padWithStr}`
}

/**
 * Run action for directory and it's children directories recursively
 */
function recdir(pathDir, action) {
    const stats = fs.statSync(pathDir)
    if (stats.isDirectory()) {
        const contents = fs.readdirSync(pathDir)
        // console.log(contents);
        for (const c of contents) {
            recdir(path.join(pathDir, c), action)
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

    pad,

    color: {
        NAME: CL,
        red: gc(CL.Red),
        green: gc(CL.Green),
        blue: gc(CL.Blue),
        darkgray: gc(CL.Darkgray),
        _lightblue: gc(CL._Lightblue),
    },
}
