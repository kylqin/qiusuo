const Utils = require('../utils')
const blessed = require('blessed');
const cp = require('child_process')
const open = require('open')
const path = require('path')

const {
    darkgray,
    _lightblue
} = Utils.color

module.exports = {
    p: function (filtered) {
        show(filtered)
    }
}

function show(list) {
    const State = {
        prefixNum: ''
    }

    const listMap = list.reduce((acc, row, idx) => {
        acc[mkLabelText(row, idx + 1)] = row
        return acc
    }, {})
    const listLabels = list.map((row, idx) => mkLabelText(row, idx))

    // Create a screen object.
    const screen = blessed.screen({
        smartCSR: true,
        autoPadding: true,
        dockBorders: true,
        fullUnicode: true,
    });
    screen.title = '求索 - qiusou';

    const List = mkList(screen, list)

    List.setItems(listLabels)

    /**
     * List children events
     */
    for (let [idx, row] of list.entries()) {
        List.children[idx + 1].on('click', (i => el => {
            updatedLineNumbers(i)
            screen.render()
        })(idx))
    }

    /**
     * List events
     */
    List.on('select', (el, selected) => {
        if (List._.rendering) return

        // const name = el.getText()
        openItem(selected)
    })

    /**
     * Screen events
     */
    // Accumulate the prefix num
    const regDigit = /^\d$/
    screen.on('keypress', (key) => {
        if (regDigit.test(key)) {
            State.prefixNum += key
        }
    })

    // key map
    // Quit on Escape, q, or Control-C.
    screen.key(['q'], (ch, key) => {
        return process.exit(0)
    })
    screen.key(['g'], (ch, key) => {
        select(0)
    })
    screen.key(['S-g'], (ch, key) => {
        select(list.length - 1)
    })
    screen.key(['j'], (ch, key) => {
        selectOffset(1 * Number(applyPrefixNum() || 1))
    })
    screen.key(['k'], (ch, key) => {
        selectOffset(-1 * Number(applyPrefixNum() || 1))
    })
    screen.key(['S-j', 'C-n'], (ch, key) => {
        selectOffset(15 * Number(applyPrefixNum() || 1))
    })
    screen.key(['S-k', 'C-p'], (ch, key) => {
        selectOffset(-15 * Number(applyPrefixNum() || 1))
    })
    screen.key(['o'], (ch, key) => {
        openItem(List.selected)
    })
    screen.key(['S-o'], (ch, key) => {
        openItemDir(List.selected)
    })

    /**
     * helpers
     */
    // Generate line context with line number
    function mkLabelText(row, idx) {
        return `{gray-fg}${Utils.pad(3, idx, ' ')}{/gray-fg} ${row.string}`
    }

    // Select row by index
    function select(idx) {
        updatedLineNumbers(idx)
        List.select(idx)
    }
    // Select row by offset
    function selectOffset(offset) {
        select(Math.max(0, Math.min(List.selected + offset, list.length)))
    }

    // Update line numbers
    function updatedLineNumbers(idx) {
        for (let [i, row] of list.entries()) {
            List.setItem(List.children[i + 1], mkLabelText(row, i == idx ? i : Math.abs(i - idx)))
        }
    }

    // Append the prefix num
    function appendPrefixNum(char) {
        State.prefixNum += char
    }
    // Apply the prefix num and clear it
    function applyPrefixNum() {
        const pn = State.prefixNum
        State.prefixNum = ''
        return pn
    }

    // Open selected item
    function openItem(idx) {
        open(list[idx].url)
    }
    // Open selected item
    function openItemDir(idx) {
        // log(path.dirname(list[idx].url.slice(7)))
        open(path.dirname(list[idx].url))
    }

    // Render the screen.
    screen.render();
}

function mkList(screen, list) {
    const List = blessed.list({
        parent: screen,
        label: ' {bold}{cyan-fg}Items{/cyan-fg}{/bold}',
        tags: true,
        // draggable: true,
        top: 0,
        right: 0,
        width: '100%',
        height: '100%',
        // keys: true,
        // vi: true,
        mouse: true,
        // border: 'line',
        scrollbar: {
            ch: ' ',
            track: {
                bg: '#171717',
            },
            style: {
                inverse: true
            }
        },
        style: {
            bg: '#32312D',
            fg: '#c7c7c7',
            item: {
                hover: {
                    bg: '#282B33',
                }
            },
            selected: {
                fg: '#FFFFFF',
                bg: '#FF324C',
                // bg: '#FCB0A3',
                // bg: '#9CCDAF',
                // bg: '#E5D9B3',
                bold: true,
            }
        },
        search: function (callback) {
            prompt.input('Search:', '', function (err, value) {
                if (err) return;
                return callback(null, value);
            });
        }
    })

    const prompt = blessed.prompt({
        parent: screen,
        top: 'center',
        left: 'center',
        height: 'shrink',
        width: 'shrink',
        keys: false,
        vi: true,
        mouse: true,
        tags: true,
        border: 'line',
        hidden: true
    });

    return List
}

// Help to debug
function log(msg) {
    cp.execSync(`echo "${msg}" >> _log`)
}