const Utils = require('../utils')
const blessed = require('blessed');
const cp = require('child_process')
const open = require('open')
const path = require('path')

const {
    darkgray,
    _lightblue
} = Utils.color

const M = {
    Normal: 'Normal',
    Command: 'Command',
    Visual: 'Visual',
    Insert: 'Insert',
    Motion: 'Motion'
}

module.exports = {
    p: function (filtered, searchTerm, requestResult) {
        show(filtered, searchTerm, requestResult)
    }
}

// Generate line context with line number
function lineWithNumber(row, idx) {
    return `{gray-fg}${String(idx).padStart(3, ' ')}{/gray-fg} ${row.string}`
}


function show(lst, searchTerm, requestResult) {
    const State = {
        _lst: lst,
        inputSearchText: `~${searchTerm}`,
        _mode: M.Normal,
        prefixNum: '',
    }

    // Create a screen object.
    const Screen = blessed.screen({
        smartCSR: true,
        autoPadding: true,
        dockBorders: true,
        fullUnicode: true,
    })

    const Input = InputComponent(Screen)
    const List = ListComponent(Screen)

    /**
     * List events
     */
    List.on('select', (el, selected) => {
        if (List._.rendering) return

        // const name = el.getText()
        Cmd.openItem(selected)
    })

    // Build Commands
    const Cmd = buildCommands(State, Screen, List, Input)

    // Keyboard Normal Mode Map
    buildNormalMap(mapNormal, Cmd, { State, List })

    // Keyboard Command Mode Map
    buildCommandMap(mapCommand, Cmd, { State })
    mapCommand(['enter'], (ch, key) => {
        Cmd.setMode(M.Normal)
        // log('keypress -> ' + 'Enter')
        execAction('search')
    })


    /** Screen Events */

    // Accumulate the prefix num
    const regDigit = /^\d$/
    Screen.on('keypress', (key, o) => {
        // log('keypress -> ' + key + JSON.stringify(o))
        if (regDigit.test(key)) {
            State.prefixNum += key
        }

        if (isMode(M.Command)) {
            if (key !== '\r') { // 不是 enter
                Cmd.setInputContent(State.inputSearchText + key)
            }
        }
        return false
    })

    // Exec actions
    function execAction (name) {
        if (name === 'search') {
            // search
            Cmd.setInputContent(State.inputSearchText.replace(/\//, '~'))
            const st = State.inputSearchText.slice(1)
            requestResult(st, (result) => {
                State._lst = result || []
                Cmd.updateList()
            })
        }
    }

    /** mode */

    function mapNormal(keys, handler) {
        Screen.key(keys, (...args) => { isMode(M.Normal) && handler(...args) })
    }
    function mapCommand(keys, handler) {
        Screen.key(keys, (...args) => { isMode(M.Command) && handler(...args) })
    }

    function isMode(mode) {
        return State._mode === mode
    }

    // Initial

    Cmd.setTitle('QIUSUO - 求索')

    Cmd.updateList()
    Cmd.updatedLineNumbers(0)

    Cmd.setInputContent(State.inputSearchText)
}

function buildCommands(State, Screen, List, Input) {
    const cmd = {}

    cmd.setTitle = (title) => {
        Screen.title = title
    }

    cmd.setMode = (mode) => {
        State._mode = mode
    }

    // Select row by index
    cmd.select = (idx) => {
        cmd.updatedLineNumbers(idx)
        List.select(idx)
    }

    // Select row by offset
    cmd.selectOffset = (offset) => {
        cmd.select(Math.max(0, Math.min(List.selected + offset, State._lst.length - 1)))
    }

    // Update line numbers
    cmd.updatedLineNumbers = (idx) => {
        for (let [i, row] of State._lst.entries()) {
            List.setItem(List.children[i + 1], lineWithNumber(row, i == idx ? i + 1 : Math.abs(i - idx)))
        }
    }

    // Append the prefix num
    cmd.appendPrefixNum = (char) => {
        State.prefixNum += char
    }

    // Apply the prefix num and clear it
    cmd.applyPrefixNum = () => {
        const pn = State.prefixNum
        State.prefixNum = ''
        return pn
    }

    cmd.setInputContent = (ctt) => {
        // log('setInputContent -> ' + ctt)
        State.inputSearchText = ctt
        Input.setContent(State.inputSearchText)
        Screen.render()
    }

    cmd.clearInputContent = () => {
        State.inputSearchText = ''
        Input.setContent(State.inputSearchText)
    }

    // Open selected item
    cmd.openItem = (idx) => {
        open(State._lst[idx].url)
    }
    // Open selected item
    cmd.openItemDir = (idx) => {
        open(path.dirname(State._lst[idx].url))
    }

    cmd.updateList = () => {
        const listLabels = State._lst.map((row, idx) => lineWithNumber(row, idx))
        List.setItems(listLabels)

        /**
         * List children events
         */
        for (let [idx, row] of State._lst.entries()) {
            List.children[idx + 1].on('click', (i => el => {
                cmd.updatedLineNumbers(i)
                Screen.render()
            })(idx))
        }

        // Render the screen.
        Screen.render();
    }

    return cmd
}

function buildNormalMap(mapNormal, Cmd, { State, List }) {
    // Quit on Escape, q, or Control-C.
    mapNormal(['q'], (ch, key) => {
        Cmd.setTitle('')
        return process.exit(0)
    })
    mapNormal(['g'], (ch, key) => {
        Cmd.select(0)
    })
    mapNormal(['S-g'], (ch, key) => {
        Cmd.select(State._lst.length - 1)
    })
    mapNormal(['j'], (ch, key) => {
        Cmd.selectOffset(1 * Number(Cmd.applyPrefixNum() || 1))
    })
    mapNormal(['k'], (ch, key) => {
        Cmd.selectOffset(-1 * Number(Cmd.applyPrefixNum() || 1))
    })
    mapNormal(['S-j', 'C-n', 'linefeed'], (ch, key) => { // linefeed is C-j
        Cmd.selectOffset(15 * Number(Cmd.applyPrefixNum() || 1))
    })
    mapNormal(['S-k', 'C-p', 'C-k'], (ch, key) => {
        Cmd.selectOffset(-15 * Number(Cmd.applyPrefixNum() || 1))
    })
    mapNormal(['o'], (ch, key) => {
        Cmd.openItem(List.selected)
    })
    mapNormal(['S-o'], (ch, key) => {
        Cmd.openItemDir(List.selected)
    })
    mapNormal(['n'], (ch, key) => {
        const frIdx = List.fuzzyFind(State.inputSearchText.replace(/\*/, ''))
        // log(State.inputSearchText.replace(/\*/, '') + ' : ' + frIdx)
        Cmd.select(frIdx)
    })
    mapNormal(['/'], (ch, key) => {
        Cmd.setMode(M.Command)
        // Input.focus()
        // Cmd.clearInputContent()
        Cmd.setInputContent('/')
    })
}

function buildCommandMap(mapCommand, Cmd, { State }) {
    mapCommand(['backspace'], (ch, key) => {
        // log('mapCommand backspace')
        Cmd.setInputContent(`/${State.inputSearchText.slice(1, -2)}`)
    })
    mapCommand(['C-u'], (ch, key) => {
        Cmd.setInputContent('/')
    })
    mapCommand(['C-g'], (ch, key) => {
        Cmd.setInputContent('')
        Cmd.setMode(M.Normal)
    })
}

function InputComponent(screen) {
    const Input = blessed.input({
        parent: screen,
        top: 0,
        left: 0,
        width: '100%',
        height: 'shrink',
        border: 'line',
        style: {
            // bg: '#FCB0A3',
            border: {
                fg: 'blue'
            }
        }
    })
    return Input
}

function ListComponent(screen) {
    const List = blessed.list({
        parent: screen,
        label: ' {bold}{cyan-fg}Items{/cyan-fg}{/bold}',
        tags: true,
        // draggable: true,
        // top: '80',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '100%-3',
        // keys: true,
        // vi: true,
        mouse: true,
        border: 'line',
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
function log(...msg) {
    // cp.execSync(`echo "${msg}" >> _log`)
}