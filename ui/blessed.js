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

function show(lst, searchTerm, requestResult) {
    const State = {
        _lst: lst,
        inputSearchText: `*${searchTerm}`,
        _mode: M.Normal,
        prefixNum: '',
    }

    // Create a screen object.
    const screen = blessed.screen({
        smartCSR: true,
        autoPadding: true,
        dockBorders: true,
        fullUnicode: true,
    })

    screen.title = '求索 - qiusou'

    const Input = addInput(screen)
    const List = mkList(screen)

    function setItems () {
        const listLabels = State._lst.map((row, idx) => mkLabelText(row, idx))
        List.setItems(listLabels)

        /**
         * List children events
         */
        for (let [idx, row] of State._lst.entries()) {
            List.children[idx + 1].on('click', (i => el => {
                updatedLineNumbers(i)
                screen.render()
            })(idx))
        }

        // Render the screen.
        screen.render();
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
    screen.on('keypress', (key, o) => {
        // log('keypress -> ' + key + JSON.stringify(o))
        if (regDigit.test(key)) {
            State.prefixNum += key
        } else if (isMode(M.Normal) && key === '/') {
            setMode(M.Command)
            // Input.focus()
            State.inputSearchText = ''
        } else if (isMode(M.Command) && o.name === 'enter') {
            setMode(M.Normal)
            // log('keypress -> ' + 'Enter')
            execAction('search')
        }

        if (isMode(M.Command)) {
            setInputContent(State.inputSearchText + key)
        }
        return false
    })

    // key map
    // Quit on Escape, q, or Control-C.
    mapNormal(['q'], (ch, key) => {
        return process.exit(0)
    })
    mapNormal(['g'], (ch, key) => {
        select(0)
    })
    mapNormal(['S-g'], (ch, key) => {
        select(State._lst.length - 1)
    })
    mapNormal(['j'], (ch, key) => {
        selectOffset(1 * Number(applyPrefixNum() || 1))
    })
    mapNormal(['k'], (ch, key) => {
        selectOffset(-1 * Number(applyPrefixNum() || 1))
    })
    mapNormal(['S-j', 'C-n', 'linefeed'], (ch, key) => { // linefeed is C-j
        selectOffset(15 * Number(applyPrefixNum() || 1))
    })
    mapNormal(['S-k', 'C-p', 'C-k'], (ch, key) => {
        selectOffset(-15 * Number(applyPrefixNum() || 1))
    })
    mapNormal(['o'], (ch, key) => {
        openItem(List.selected)
    })
    mapNormal(['S-o'], (ch, key) => {
        openItemDir(List.selected)
    })
    mapNormal(['n'], (ch, key) => {
        const frIdx = List.fuzzyFind(State.inputSearchText.replace(/\*/, ''))
        // log(State.inputSearchText.replace(/\*/, '') + ' : ' + frIdx)
        select(frIdx)
    })

    // Command map
    mapCommand(['backspace'], (ch, key) => {
        // log('mapCommand backspace')
        setInputContent(`/${State.inputSearchText.slice(1, -2)}`)
    })
    mapCommand(['C-u'], (ch, key) => {
        setInputContent('/')
    })
    mapCommand(['C-g'], (ch, key) => {
        setInputContent('')
        setMode(M.Normal)
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
        select(Math.max(0, Math.min(List.selected + offset, State._lst.length)))
    }

    // Update line numbers
    function updatedLineNumbers(idx) {
        for (let [i, row] of State._lst.entries()) {
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

    function setInputContent (ctt) {
        // log('setInputContent -> ' + ctt)
        State.inputSearchText = ctt
        Input.setContent(State.inputSearchText)
        screen.render()
    }

    // Open selected item
    function openItem(idx) {
        open(State._lst[idx].url)
    }
    // Open selected item
    function openItemDir(idx) {
        open(path.dirname(State._lst[idx].url))
    }

    // Exec action
    function execAction (name) {
        if (name === 'search') {
            // search
            setInputContent(State.inputSearchText.replace(/\//, '*'))
            const st = State.inputSearchText.slice(1)
            requestResult(st, (result) => {
                State._lst = result || []
                setItems()
            })
        }
    }

    /**
     * _mode
     */
    function mapNormal(keys, handler) {
        screen.key(keys, (...args) => { isMode(M.Normal) && handler(...args) })
    }
    function mapCommand(keys, handler) {
        screen.key(keys, (...args) => { isMode(M.Command) && handler(...args) })
    }

    function setMode(mode) {
        State._mode = mode
    }
    function isMode(mode) {
        return State._mode === mode
    }

    setItems()
}

function addInput(screen) {
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

function mkList(screen) {
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
function log(msg) {
    cp.execSync(`echo "${msg}" >> _log`)
}