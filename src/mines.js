/**
 * Mines thing
 */

// From MDN (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#Example:_Using_Math.random)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

const COVERED_CLASS = "covered",
    FLAGGED_CLASS = "flagged",
    FLASH_CLASS = "invalid",
    DEFAULT_SIZE = 8,
    DEFAULT_MINE_COUNT = 10,
    ADVANCED_SIZE = 16,
    ADVANCED_MINE_COUNT = 40,
    EXPERT_HEIGHT = 16,
    EXPERT_WIDTH = 30,
    EXPERT_MINE_COUNT = 99,
    DIM_X = 0,
    DIM_Y = 1,
    ORIGIN = 0,
    RIGHT_CLICK = 2;

function Mines(cfx, dimensions, mineCount) {
    this.dimensions = dimensions || [
        DEFAULT_SIZE,
        DEFAULT_SIZE
    ];
    this.mineCount = mineCount || DEFAULT_MINE_COUNT;
    this.context = cfx;

    const board = [],
        marked = [];

    for(let y = 0; y < dimensions[DIM_Y]; ++y) {
        board.push([]);
        marked.push([]);
        for(let x = 0; x < dimensions[DIM_X]; ++x) {
            board[y].push(Mines.AIR);
            marked[y].push(Mines.MINE_UNKNOWN);
        }
    }

    this.board = board;
    this.markedMines = marked;

    this.printEmptyBoard();
    this.context.parentNode.removeAttribute("aria-busy");

    this.context.addEventListener("keydown", (e) => {
        const KEYCODE = {
            r: 82,
            capsLock: 82,
            p: 80,
            pause: 8,
            pauseAlt: 19,
            f1: 112
        };
        if(e.key == "r" || e.keyCode == KEYCODE.r || e.key == "F2") {
            this.reset();
        }
        else if(e.key == "CapsLock" || e.keyCode == KEYCODE.capsLock) {
            this.toggleMode();
            e.preventDefault();
        }
        else if(e.key == "p" || e.keyCode == KEYCODE.p || e.key == "Pause" || e.keyCode == KEYCODE.pause ||
                e.keyCode == KEYCODE.pauseAlt) {
            this.togglePause();
        }
        else if(e.key == "F1" || e.keyCode == KEYCODE.f1) {
            this.context.dispatchEvent(new Event("help"));
        }
        //TODO F4 stats
        //TODO F5 options
    }, false);

    if(Mines.hasSavedState()) {
        Mines.removeSavedState();
    }
}

Mines.AIR = 0;
Mines.MINE_1 = 1;
Mines.MINE_2 = 2;
Mines.MINE_3 = 3;
Mines.MINE_4 = 4;
Mines.MINE_5 = 5;
Mines.MINE_6 = 6;
Mines.MINE_7 = 7;
Mines.MINE_8 = 8;
Mines.MINE = 9;

Mines.CLASSES = [
    "air",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "mine"
];

Mines.getClassForContent = function(c) {
    return this.CLASSES[c];
};

Mines.MODE_UNCOVER = false;
Mines.MODE_FLAG = true;

Mines.MINE_UNKNOWN = 0;
Mines.MINE_FLAG = 1;
Mines.MINE_KNOWN = 2;

Mines.defaultBoards = {
    "beginner": {
        "size": [
            DEFAULT_SIZE,
            DEFAULT_SIZE
        ],
        "mines": DEFAULT_MINE_COUNT
    },
    "advanced": {
        "size": [
            ADVANCED_SIZE,
            ADVANCED_SIZE
        ],
        "mines": ADVANCED_MINE_COUNT
    },
    "expert": {
        "size": [
            EXPERT_WIDTH,
            EXPERT_HEIGHT
        ],
        "mines": EXPERT_MINE_COUNT
    }
};

Mines.prototype.dimensions = [];
Mines.prototype.mineCount = 0;
Mines.prototype.context = null;
Mines.prototype.board = [];
Mines.prototype.markedMines = [];
Mines.prototype.boardGenerated = false;
Mines.prototype.done = false;
Mines.prototype.paused = false;
Mines.prototype.mode = Mines.MODE_UNCOVER;
Mines.prototype.size = 1;
Mines.prototype.autoUncover = true;

Mines.prototype.pause = function() {
    this.paused = true;
    this.context.classList.add("paused");
    this.context.dispatchEvent(new Event("pause"));
};

Mines.prototype.unpause = function() {
    this.paused = false;
    this.context.classList.remove("paused");
    this.context.dispatchEvent(new Event("unpause"));
};

Mines.prototype.togglePause = function() {
    if(this.paused) {
        this.unpause();
    }
    else {
        this.pause();
    }
};

Mines.prototype.translateCell = function(x, y, deferTranslation) {
    const node = this.getCell(x, y);
    this.translateCellNode(x, y, node, deferTranslation);
};

Mines.prototype.translateCellNode = function(x, y, node, deferTranslation) {
    let l10nId = "mines_cell_covered";
    if(this.markedMines[y][x] == Mines.MINE_KNOWN) {
        l10nId = `mines_cell_${this.board[y][x] == Mines.MINE ? "mine" : "known"}`;
    }
    else if(this.markedMines[y][x] == Mines.MINE_FLAG) {
        l10nId = "mines_cell_flagged";
    }
    const ONE_BASED = 1;
    navigator.mozL10n.setAttributes(node, l10nId, {
        x: x + ONE_BASED,
        y: y + ONE_BASED,
        val: this.board[y][x]
    });
    if(!deferTranslation) {
        navigator.mozL10n.translateFragment(node);
    }
};

Mines.prototype.setSize = function(size) {
    this.size = size;
    this.context.style.fontSize = `${size}em`;
};

Mines.prototype.gameOver = function() {
    this.context.classList.add("gameover");
    this.context.classList.add("done");
    this.context.setAttribute("aria-readonly", "true");
    this.done = true;

    if(Mines.hasSavedState()) {
        Mines.removeSavedState();
    }

    this.context.dispatchEvent(new Event("loose"));
};

Mines.prototype.win = function() {
    this.context.classList.add("done");
    this.context.setAttribute("aria-readonly", "true");
    this.done = true;

    if(Mines.hasSavedState()) {
        Mines.removeSavedState();
    }

    this.context.dispatchEvent(new Event("win"));
};

Mines.prototype.reset = function() {
    const board = [],
        marked = [];
    for(let y = 0; y < this.dimensions[DIM_Y]; ++y) {
        board.push([]);
        marked.push([]);
        for(let x = 0; x < this.dimensions[DIM_X]; ++x) {
            board[y].push(Mines.AIR);
            marked[y].push(Mines.MINE_UNKNOWN);
        }
    }

    this.board = board;
    this.markedMines = marked;
    this.boardGenerated = false;
    this.done = false;
    this.printEmptyBoard();

    this.mode = Mines.MODE_UNCOVER;

    this.context.classList.remove("done");
    this.context.classList.remove("gameover");
    this.context.setAttribute("aria-readonly", "false");

    if(Mines.hasSavedState()) {
        Mines.removeSavedState();
    }

    this.context.dispatchEvent(new Event("reset"));
};

Mines.prototype.toggleMode = function() {
    if(this.mode == Mines.MODE_UNCOVER) {
        this.mode = Mines.MODE_FLAG;
    }
    else {
        this.mode = Mines.MODE_UNCOVER;
    }

    this.context.dispatchEvent(new Event("modetoggle"));
};

Mines.prototype.generate = function(emptyPoint) {
    // Place Mines
    let remainingMines = this.mineCount,
        x,
        y;
    while(remainingMines) {
        x = getRandomInt(ORIGIN, this.dimensions[DIM_X]);
        y = getRandomInt(ORIGIN, this.dimensions[DIM_Y]);
        if(this.board[y][x] != Mines.MINE && (x != emptyPoint[DIM_X] || y != emptyPoint[DIM_Y])) {
            this.addMine(x, y);
            --remainingMines;
        }
    }
    this.boardGenerated = true;
    this.printBoard();
    this.context.dispatchEvent(new Event("generated"));
};

Mines.prototype.addMine = function(x, y) {
    this.board[y][x] = Mines.MINE;

    // Mark the mine around itself
    /* eslint-disable no-magic-numbers */
    const left = x > ORIGIN,
        right = x < this.dimensions[DIM_X] - 1;
    if(y > ORIGIN) {
        this.addNeighbouringMine(x, y - 1);
        if(left) {
            this.addNeighbouringMine(x - 1, y - 1);
        }
        if(right) {
            this.addNeighbouringMine(x + 1, y - 1);
        }
    }
    if(y < this.dimensions[DIM_Y] - 1) {
        this.addNeighbouringMine(x, y + 1);
        if(left) {
            this.addNeighbouringMine(x - 1, y + 1);
        }
        if(right) {
            this.addNeighbouringMine(x + 1, y + 1);
        }
    }
    if(left) {
        this.addNeighbouringMine(x - 1, y);
    }
    if(right) {
        this.addNeighbouringMine(x + 1, y);
    }
    /* eslint-enable no-magic-numbers */
};

Mines.prototype.addNeighbouringMine = function(x, y) {
    if(this.board[y][x] !== Mines.MINE) {
        ++this.board[y][x];
    }
};

Mines.prototype.countFlags = function() {
    const NO_FLAGS = 0;
    if(!this.boardGenerated) {
        return NO_FLAGS;
    }
    return this.markedMines.reduce((p, row) => row.reduce((prev, cell) => {
        if(Mines.MINE_FLAG === cell) {
            return ++prev;
        }
        return prev;
    }, p), NO_FLAGS);
};

Mines.prototype.nonMinesCovered = function() {
    if(!this.boardGenerated) {
        return true;
    }
    let count = 0;
    // Flatten array
    return this.markedMines.reduce((p, row) => p.concat(row), []).some(function(mine) {
        if(Mines.MINE_KNOWN === mine) {
            return false;
        }

        ++count;
        return count > this.mineCount;
    }, this);
};

Mines.prototype.getCell = function(x, y) {
    if(x >= ORIGIN && y >= ORIGIN && x < this.dimensions[DIM_X] && y < this.dimensions[DIM_Y]) {
        return this.context.rows[y].cells[x];
    }

    return null;
};

Mines.prototype.uncoverCell = function(x, y, force) {
    if(force || (this.markedMines[y][x] === Mines.MINE_UNKNOWN && !this.done)) {
        if(!this.boardGenerated) {
            this.generate([
                x,
                y
            ]);
        }

        const cell = this.getCell(x, y);

        cell.classList.remove(COVERED_CLASS);
        cell.setAttribute("aria-pressed", "true");
        this.markedMines[y][x] = Mines.MINE_KNOWN;
        this.translateCellNode(x, y, cell);

        if(Mines.MINE === this.board[y][x]) {
            this.gameOver();
        }
        else if(!this.nonMinesCovered()) {
            this.win();
        }
        else if(this.cellFullyMarked(x, y) && this.autoUncover) {
            /* eslint-disable no-magic-numbers */
            const left = x > ORIGIN,
                right = x < this.dimensions[DIM_X] - 1;
            if(y > ORIGIN) {
                this.uncoverCell(x, y - 1);
                if(left) {
                    this.uncoverCell(x - 1, y - 1);
                }
                if(right) {
                    this.uncoverCell(x + 1, y - 1);
                }
            }
            if(y < this.dimensions[DIM_Y] - 1) {
                this.uncoverCell(x, y + 1);
                if(left) {
                    this.uncoverCell(x - 1, y + 1);
                }
                if(right) {
                    this.uncoverCell(x + 1, y + 1);
                }
            }
            if(left) {
                this.uncoverCell(x - 1, y);
            }
            if(right) {
                this.uncoverCell(x + 1, y);
            }
            /* eslint-enable no-magic-numbers */
        }
    }
};

Mines.prototype.flagCell = function(x, y, force) {
    const cell = this.getCell(x, y);
    if(!force && Mines.MINE_FLAG === this.markedMines[y][x]) {
        // Cell has already been flagged, so we unflag it
        this.markedMines[y][x] = Mines.MINE_UNKNOWN;
        cell.classList.remove(FLAGGED_CLASS);
        cell.setAttribute("aria-pressed", "false");
        this.translateCellNode(x, y, cell);

        this.context.dispatchEvent(new Event("unflagged"));
    }
    else {
        this.markedMines[y][x] = Mines.MINE_FLAG;
        cell.classList.add(FLAGGED_CLASS);
        cell.setAttribute("aria-pressed", "mixed");
        this.translateCellNode(x, y, cell);

        this.context.dispatchEvent(new Event("flagged"));
    }
};

Mines.prototype.uncoverCompleteCells = function(x, y) {
    if(this.cellFullyMarked(x, y) && this.autoUncover) {
        /* eslint-disable no-magic-numbers */
        const left = x > ORIGIN,
            right = x < this.dimensions[DIM_X] - 1;
        if(y > ORIGIN) {
            this.uncoverCell(x, y - 1);
            if(left) {
                this.uncoverCell(x - 1, y - 1);
            }
            if(right) {
                this.uncoverCell(x + 1, y - 1);
            }
        }
        if(y < this.dimensions[DIM_Y] - 1) {
            this.uncoverCell(x, y + 1);
            if(left) {
                this.uncoverCell(x - 1, y + 1);
            }
            if(right) {
                this.uncoverCell(x + 1, y + 1);
            }
        }
        if(left) {
            this.uncoverCell(x - 1, y);
        }
        if(right) {
            this.uncoverCell(x + 1, y);
        }
        /* eslint-enable no-magic-numbers */
    }
    else {
        this.getCell(x, y).classList.add(FLASH_CLASS);
    }
};

Mines.prototype.cellIsFlagged = function(x, y) {
    const FLAGGED = 1,
        NOT_FLAGGED = 0;
    return this.markedMines[y][x] == Mines.MINE_FLAG ? FLAGGED : NOT_FLAGGED;
};

Mines.prototype.cellFullyMarked = function(x, y) {
    if(Mines.MINE == this.board[y][x]) {
        return false;
    }
    else if(Mines.AIR == this.board[y][x]) {
        return true;
    }

    let surroundingFlags = 0;
    /* eslint-disable no-magic-numbers */
    const left = x > ORIGIN,
        right = x < this.dimensions[DIM_X] - 1;
    if(y > ORIGIN) {
        surroundingFlags += this.cellIsFlagged(x, y - 1);
        if(left) {
            surroundingFlags += this.cellIsFlagged(x - 1, y - 1);
        }
        if(right) {
            surroundingFlags += this.cellIsFlagged(x + 1, y - 1);
        }
    }
    if(y < this.dimensions[DIM_Y] - 1) {
        surroundingFlags += this.cellIsFlagged(x, y + 1);
        if(left) {
            surroundingFlags += this.cellIsFlagged(x - 1, y + 1);
        }
        if(right) {
            surroundingFlags += this.cellIsFlagged(x + 1, y + 1);
        }
    }
    if(left) {
        surroundingFlags += this.cellIsFlagged(x - 1, y);
    }
    if(right) {
        surroundingFlags += this.cellIsFlagged(x + 1, y);
    }
    /* eslint-enable no-magic-numbers */

    return surroundingFlags == this.board[y][x];
};

Mines.prototype.cellClickListener = function(x, y, e) {
    e.preventDefault();
    if(!this.done && !this.paused) {
        if(this.markedMines[y][x] !== Mines.MINE_KNOWN) {
            if(Mines.MODE_UNCOVER === this.mode && e.button != RIGHT_CLICK) {
                this.uncoverCell(x, y);
            }
            else {
                this.flagCell(x, y);
            }
        }
        else {
            this.uncoverCompleteCells(x, y);
        }
    }
};

Mines.prototype.createCell = function(x, y) {
    const cell = document.createElement("td"),
        clickListener = this.cellClickListener.bind(this, x, y);

    cell.classList.add(COVERED_CLASS);
    cell.setAttribute("aria-pressed", "false");
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("tabindex", ORIGIN);
    this.translateCellNode(x, y, cell);

    cell.addEventListener("click", clickListener, false);
    cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if(!this.done && this.markedMines[y][x] !== Mines.MINE_KNOWN) {
            this.flagCell(x, y);
        }
    }, false);
    cell.addEventListener("keydown", (e) => {
        const KEYCODE = {
            up: 38,
            pageUp: 33,
            down: 40,
            pageDown: 34,
            left: 37,
            right: 39,
            home: 36,
            end: 35,
            enter: 32,
            f: 70
        };
        if(e.key == "ArrowUp" || e.key == "PageUp" || e.keyCode == KEYCODE.up || e.keyCode == KEYCODE.pageUp) {
            if(y > ORIGIN) {
                this.getCell(x, y - 1).focus(); // eslint-disable-line no-magic-numbers
            }
            e.preventDefault();
            cell.scrollIntoView();
            // scrollIntoView doesn't really work with the fixed header and footer, sadly
        }
        else if(e.key == "ArrowDown" || e.key == "PageDown" || e.keyCode == KEYCODE.down || e.keyCode == KEYCODE.pageDown) {
            /* eslint-disable no-magic-numbers */
            if(y < this.dimensions[DIM_Y] - 1) {
                this.getCell(x, y + 1).focus();
            }
            /* eslint-enable no-magic-numbers */
            e.preventDefault();
            cell.scrollIntoView();
        }
        else if(e.key == "ArrowLeft" || e.keyCode == KEYCODE.left) {
            if(x > ORIGIN) {
                this.getCell(x - 1, y).focus(); // eslint-disable-line no-magic-numbers
            }
            e.preventDefault();
            cell.scrollIntoView();
        }
        else if(e.key == "ArrowRight" || e.keyCode == KEYCODE.right) {
            /* eslint-disable no-magic-numbers */
            if(x < this.dimensions[DIM_X] - 1) {
                this.getCell(x + 1, y).focus();
            }
            /* eslint-enable no-magic-numbers */
            e.preventDefault();
            cell.scrollIntoView();
        }
        else if(e.key == "Home" || e.keyCode == KEYCODE.home) {
            this.getCell(ORIGIN, ORIGIN).focus();
        }
        else if(e.key == "End" || e.keyCode == KEYCODE.end) {
            this.getCell(this.dimensions[DIM_X] - 1, this.dimensions[DIM_Y] - 1).focus(); // eslint-disable-line no-magic-numbers
        }
        else if(((e.key == " " || e.key == "Enter") && !e.ctrlKey && !e.shiftKey) || e.keyCode == KEYCODE.enter) {
            cell.click();
        }
        else if(!this.done && !this.paused) {
            if(this.markedMines[y][x] !== Mines.MINE_KNOWN) {
                if(e.key == "f" || e.keyCode == KEYCODE.f || e.key == "1" || ((e.key == " " || e.key == "Enter") && (e.ctrlKey || e.shiftKey))) {
                    e.preventDefault();
                    this.flagCell(x, y);
                }
            }
        }
    }, false);
    cell.addEventListener("transitionend", () => {
        cell.classList.remove(FLASH_CLASS);
    }, false);

    return cell;
};

Mines.prototype.createRow = function(y) {
    const row = document.createElement("tr");

    for(let i = 0; i < this.dimensions[DIM_X]; ++i) {
        row.appendChild(this.createCell(i, y));
    }
    return row;
};

Mines.prototype.generateBoard = function() {
    for(let i = 0; i < this.dimensions[DIM_Y]; ++i) {
        this.context.appendChild(this.createRow(i));
    }
};

Mines.prototype.printEmptyBoard = function() {
    if(!this.context.childElementCount) {
        this.generateBoard();
    }
    else {
        if(this.context.childElementCount > this.dimensions[DIM_Y]) {
            const rowsToRemove = this.context.childElementCount - this.dimensions[DIM_Y],
                start = --this.context.childElementCount;
            for(let i = 0; i < rowsToRemove; ++i) {
                this.context.removeChild(this.context.rows[start - i]);
            }
        }
        for(let j = 0; j < this.context.childElementCount; ++j) {
            const row = this.context.rows[j];
            let start = row.childElementCount;
            if(start > this.dimensions[DIM_X]) {
                const cellsToRemove = start - this.dimensions[DIM_X];
                for(let k = 0; k < cellsToRemove; ++k) {
                    row.removeChild(row.cells[start - k]);
                }
                start = row.childElementCount;
            }
            for(let l = 0; l < start; ++l) {
                row.cells[l].textContent = "";
                row.cells[l].className = COVERED_CLASS;
                this.translateCellNode(l, j, row.cells[l], true);
            }
            if(start < this.dimensions[DIM_X]) {
                const cellsToAdd = this.dimensions[DIM_X] - start;
                for(let m = 0; m < cellsToAdd; ++m) {
                    row.appendChild(this.createCell(start + m, j));
                }
            }
        }
        if(this.context.childElementCount < this.dimensions[DIM_Y]) {
            const rowsToAdd = this.dimensions[DIM_Y] - this.context.childElementCount,
                start = this.context.childElementCount;
            for(let n = 0; n < rowsToAdd; ++n) {
                this.context.appendChild(this.createRow(start + n));
            }
        }

        navigator.mozL10n.translateFragment(this.context);
    }
};

Mines.prototype.printBoard = function() {
    if(this.context) {
        if(!this.boardGenerated) {
            this.printEmptyBoard();
        }
        else {
            let tr;
            for(let y = 0; y < this.dimensions[DIM_Y]; ++y) {
                tr = this.context.rows[y];
                for(let x = 0; x < this.dimensions[DIM_X]; ++x) {
                    tr.cells[x].classList.add(Mines.getClassForContent(this.board[y][x]));
                }
            }
        }
    }
};

Mines.prototype.restoreBoard = function() {
    this.printBoard();
    for(let y = 0; y < this.dimensions[DIM_Y]; ++y) {
        for(let x = 0, mineState; x < this.dimensions[DIM_X]; ++x) {
            this.translateCell(x, y, true);
            mineState = this.markedMines[y][x];
            if(Mines.MINE_KNOWN === mineState) {
                this.getCell(x, y).classList.remove(COVERED_CLASS);
            }
            else if(Mines.MINE_FLAG === mineState) {
                this.getCell(x, y).classList.add(FLAGGED_CLASS);
            }
        }
    }
    navigator.mozL10n.translateFragment(this.context);
};

Mines.hasSavedState = function() {
    return localStorage.getItem("savedGame") == "true";
};
Mines.removeSavedState = function() {
    localStorage.setItem("savedGame", "false");
    localStorage.setItem("gameSettings", "");
};

Mines.prototype.saveState = function() {
    const settings = {
        mineCount: this.mineCount,
        board: this.board,
        markedMines: this.markedMines,
        mode: this.mode
    };
    localStorage.setItem("gameSettings", JSON.stringify(settings));
    localStorage.setItem("savedGame", "true");
};

Mines.restoreSavedState = function(cfx) {
    if(Mines.hasSavedState()) {
        const settings = JSON.parse(localStorage.getItem("gameSettings")),
            mines = new Mines(cfx, [
                settings.board[ORIGIN].length,
                settings.board.length
            ], settings.mineCount);
        mines.board = settings.board;
        mines.markedMines = settings.markedMines;
        mines.boardGenerated = true;
        if(settings.mode == Mines.MODE_FLAG) {
            mines.toggleMode();
        }

        mines.restoreBoard();

        return mines;
    }
    return null;
};

export default Mines;
