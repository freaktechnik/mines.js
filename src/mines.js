/**
 * Mines thing
 */

// From MDN (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#Example:_Using_Math.random)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max-min)) + min;
}

const COVERED_CLASS = "covered",
    FLAGGED_CLASS = "flagged",
    FLASH_CLASS = "invalid";

function Mines(cfx, dimensions, mineCount) {
    this.dimensions = dimensions || [ 8, 8 ];
    this.mineCount = mineCount || 10;
    this.context = cfx;

    var board = [],
        marked = [],
        y,
        x,
        self = this;
    for(y = 0; y < dimensions[1]; ++y) {
        board.push([]);
        marked.push([]);
        for(x = 0; x < dimensions[0]; ++x) {
            board[y].push(Mines.AIR);
            marked[y].push(Mines.MINE_UNKNOWN);
        }
    }

    this.board = board;
    this.markedMines = marked;

    this.printEmptyBoard();
    this.context.parentNode.removeAttribute("aria-busy");

    this.context.addEventListener("keydown", function(e) {
        if(e.key == "r" || e.keyCode == 82) {
            self.reset();
        }
        else if(e.key == "CapsLock" || e.keyCode == 20) {
            self.toggleMode();
            e.preventDefault();
        }
        else if(e.key == "Pause" || e.keyCode == 8 ||
                e.keyCode == 19) {
            self.togglePause();
        }
        else if(e.key == "F1" || e.keyCode == 112) {
            self.context.dispatchEvent(new Event("help"));
        }
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
    "beginner": { "size": [ 8, 8 ], "mines": 10 },
    "advanced": { "size": [ 16, 16 ], "mines": 40 },
    "expert": { "size": [ 30, 16 ], "mines": 99 }
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
    var node = this.getCell(x, y);
    this.translateCellNode(x, y, node, deferTranslation);
};

Mines.prototype.translateCellNode = function(x, y, node, deferTranslation) {
    var l10nId = "mines_cell_covered";
    if(this.markedMines[y][x] == Mines.MINE_KNOWN) {
        l10nId = "mines_cell_" + (this.board[y][x] == Mines.MINE ? "mine": "known");
    }
    else if(this.markedMines[y][x] == Mines.MINE_FLAG) {
        l10nId = "mines_cell_flagged";
    }
    navigator.mozL10n.setAttributes(node, l10nId, {
        x: x + 1,
        y: y + 1,
        val: this.board[y][x]
    });
    if(!deferTranslation) {
        navigator.mozL10n.translateFragment(node);
    }
};

Mines.prototype.setSize = function(size) {
    this.size = size;
    this.context.style.fontSize = size + 'em';
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
    var board = [],
        marked = [],
        y,
        x;
    for(y = 0; y < this.dimensions[1]; ++y) {
        board.push([]);
        marked.push([]);
        for(x = 0; x < this.dimensions[0]; ++x) {
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
    var remainingMines = this.mineCount,
        x,
        y;
    while(remainingMines > 0) {
        x = getRandomInt(0, this.dimensions[0]);
        y = getRandomInt(0, this.dimensions[1]);
        if(this.board[y][x] != Mines.MINE && (x != emptyPoint[0] || y != emptyPoint[1])) {
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
    var left = x > 0,
        right = x < this.dimensions[0] - 1;
    if(y > 0) {
        this.addNeighbouringMine(x, y-1);
        if(left) {
            this.addNeighbouringMine(x-1, y-1);
        }
        if(right) {
            this.addNeighbouringMine(x+1, y-1);
        }
    }
    if(y < this.dimensions[1] - 1) {
        this.addNeighbouringMine(x, y+1);
        if(left) {
            this.addNeighbouringMine(x-1, y+1);
        }
        if(right) {
            this.addNeighbouringMine(x+1, y+1);
        }
    }
    if(left) {
        this.addNeighbouringMine(x-1, y);
    }
    if(right) {
        this.addNeighbouringMine(x+1, y);
    }
};

Mines.prototype.addNeighbouringMine = function(x, y) {
    if(this.board[y][x] !== Mines.MINE) {
        ++this.board[y][x];
    }
};

Mines.prototype.countFlags = function() {
    if(!this.boardGenerated) {
        return 0;
    }
    return this.markedMines.reduce(function(p, row) {
        return row.reduce(function(p, cell) {
            if(Mines.MINE_FLAG === cell) {
                return p + 1;
            }
            else {
                return p;
            }
        }, p);
    }, 0);
};

Mines.prototype.nonMinesCovered = function() {
    if(!this.boardGenerated) {
        return true;
    }
    var count = 0;
    // Flatten array
    return this.markedMines.reduce(function(p, row) {
        return p.concat(row);
    }, []).some(function(mine) {
        if(Mines.MINE_KNOWN === mine) {
            return false;
        }
        else {
            ++count;
            return count > this.mineCount;
        }
    }, this);
};

Mines.prototype.getCell = function(x, y) {
    if(x >= 0 && y >= 0 && x < this.dimensions[0] && y < this.dimensions[1]) {
        return this.context.rows[y].cells[x];
    }
    else {
        return null;
    }
};

Mines.prototype.uncoverCell = function(x, y, force) {
    if(force || (this.markedMines[y][x] === Mines.MINE_UNKNOWN && !this.done)) {
        if(!this.boardGenerated) {
            this.generate([ x, y ]);
        }

        var cell = this.getCell(x, y),
            left,
            right;
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
        else if(this.cellFullyMarked(x, y)) {
            left = x > 0,
            right = x < this.dimensions[0] - 1;
            if(y > 0) {
                this.uncoverCell(x, y-1);
                if(left) {
                    this.uncoverCell(x-1, y-1);
                }
                if(right) {
                    this.uncoverCell(x+1, y-1);
                }
            }
            if(y < this.dimensions[1] - 1) {
                this.uncoverCell(x, y+1);
                if(left) {
                    this.uncoverCell(x-1, y+1);
                }
                if(right) {
                    this.uncoverCell(x+1, y+1);
                }
            }
            if(left) {
                this.uncoverCell(x-1, y);
            }
            if(right) {
                this.uncoverCell(x+1, y);
            }
        }
    }
};

Mines.prototype.flagCell = function(x, y, force) {
    var cell = this.getCell(x, y);
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
    if(this.cellFullyMarked(x, y)) {
        var left = x > 0,
            right = x < this.dimensions[0] - 1;
        if(y > 0) {
            this.uncoverCell(x, y-1);
            if(left) {
                this.uncoverCell(x-1, y-1);
            }
            if(right) {
                this.uncoverCell(x+1, y-1);
            }
        }
        if(y < this.dimensions[1] - 1) {
            this.uncoverCell(x, y+1);
            if(left) {
                this.uncoverCell(x-1, y+1);
            }
            if(right) {
                this.uncoverCell(x+1, y+1);
            }
        }
        if(left) {
            this.uncoverCell(x-1, y);
        }
        if(right) {
            this.uncoverCell(x+1, y);
        }
    }
    else {
        this.getCell(x, y).classList.add(FLASH_CLASS);
    }
};

Mines.prototype.cellIsFlagged = function(x, y) {
    return this.markedMines[y][x] == Mines.MINE_FLAG ? 1 : 0;
};

Mines.prototype.cellFullyMarked = function(x, y) {
    if(Mines.MINE == this.board[y][x]) {
        return false;
    }
    else if(Mines.AIR == this.board[y][x]) {
        return true;
    }
    else {
        var surroundingFlags = 0,
            left = x > 0,
            right = x < this.dimensions[0] - 1;
        if(y > 0) {
            surroundingFlags += this.cellIsFlagged(x, y-1);
            if(left) {
                surroundingFlags += this.cellIsFlagged(x-1, y-1);
            }
            if(right) {
                surroundingFlags += this.cellIsFlagged(x+1, y-1);
            }
        }
        if(y < this.dimensions[1] - 1) {
            surroundingFlags += this.cellIsFlagged(x, y+1);
            if(left) {
                surroundingFlags += this.cellIsFlagged(x-1, y+1);
            }
            if(right) {
                surroundingFlags += this.cellIsFlagged(x+1, y+1);
            }
        }
        if(left) {
            surroundingFlags += this.cellIsFlagged(x-1, y);
        }
        if(right) {
            surroundingFlags += this.cellIsFlagged(x+1, y);
        }

        return surroundingFlags == this.board[y][x];
    }
};

Mines.prototype.cellClickListener = function(x, y, e) {
    e.preventDefault();
    if(!this.done && !this.paused) {
        if(this.markedMines[y][x] !== Mines.MINE_KNOWN) {
            if(Mines.MODE_UNCOVER === this.mode && e.button != 2) {
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
    var cell = document.createElement("td"),
        self = this,
        clickListener = this.cellClickListener.bind(this, x, y);

    cell.classList.add(COVERED_CLASS);
    cell.setAttribute("aria-pressed", "false");
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("tabindex", 0);
    this.translateCellNode(x, y, cell);

    cell.addEventListener("click", clickListener, false);
    cell.addEventListener("contextmenu", function(e) {
        e.preventDefault();
        if(!self.done && self.markedMines[y][x] !== Mines.MINE_KNOWN) {
            self.flagCell(x, y);
        }
    }, false);
    cell.addEventListener("keydown", function(e) {
        if(e.key == "ArrowUp" || e.key == "PageUp" || e.keyCode == 38 || e.keyCode == 33) {
            if(y > 0) {
                self.getCell(x, y-1).focus();
            }
            e.preventDefault();
            cell.scrollIntoView();
            // scrollIntoView doesn't really work with the fixed header and footer, sadly
        }
        else if(e.key == "ArrowDown" || e.key == "PageDown" || e.keyCode == 40 || e.keyCode == 34) {
            if(y < self.dimensions[1] - 1) {
                self.getCell(x, y+1).focus();
            }
            e.preventDefault();
            cell.scrollIntoView();
        }
        else if(e.key == "ArrowLeft" || e.keyCode == 37) {
            if(x > 0) {
                self.getCell(x-1, y).focus();
            }
            e.preventDefault();
            cell.scrollIntoView();
        }
        else if(e.key == "ArrowRight" || e.keyCode == 39) {
            if(x < self.dimensions[0] - 1) {
                self.getCell(x+1, y).focus();
            }
            e.preventDefault();
            cell.scrollIntoView();
        }
        else if(e.key == "Home" || e.keyCode == 36) {
            self.getCell(0, 0).focus();
        }
        else if(e.key == "End" || e.keyCode == 35 ) {
            self.getCell(self.dimensions[0]-1, self.dimensions[1]-1).focus();
        }
        else if(e.key == " " || e.keyCode == 32) {
            cell.click();
        }
        else if(!self.done && !self.paused) {
            if(self.markedMines[y][x] !== Mines.MINE_KNOWN) {
                if(e.key == "f" || e.keyCode == 70) {
                    e.preventDefault();
                    self.flagCell(x, y);
                }
            }
        }
    }, false);
    cell.addEventListener("transitionend", function() {
        cell.classList.remove(FLASH_CLASS);
    }, false);

    return cell;
};

Mines.prototype.createRow = function(y) {
    var row = document.createElement("tr"),
        i;
    for(i = 0; i < this.dimensions[0]; ++i) {
        row.appendChild(this.createCell(i, y));
    }
    return row;
};

Mines.prototype.generateBoard = function() {
    for(var i = 0; i < this.dimensions[1]; ++i) {
        this.context.appendChild(this.createRow(i));
    }
};

Mines.prototype.printEmptyBoard = function() {
    if(!this.context.childElementCount) {
        this.generateBoard();
    }
    else {
        var start,
            row,
            rowsToRemove,
            cellsToRemove,
            rowsToAdd,
            cellsToAdd,
            i,
            j,
            k,
            l,
            m,
            n;
        if(this.context.childElementCount > this.dimensions[1]) {
            rowsToRemove = this.context.childElementCount - this.dimensions[1];
            start = this.context.childElementCount - 1;
            for(i = 0; i < rowsToRemove; ++i) {
                this.context.removeChild(this.context.rows[start - i]);
            }
        }
        for(j = 0; j < this.context.childElementCount; ++j) {
            row = this.context.rows[j];
            start = row.childElementCount;
            if(start > this.dimensions[0]) {
                cellsToRemove = start - this.dimensions[0];
                for(k = 0; k < cellsToRemove; ++k) {
                    row.removeChild(row.cells[start - k]);
                }
                start = row.childElementCount;
            }
            for(l = 0; l < start; ++l) {
                row.cells[l].textContent = "";
                row.cells[l].className = COVERED_CLASS;
                this.translateCellNode(l, j, row.cells[l], true);
            }
            if(start < this.dimensions[0]) {
                cellsToAdd = this.dimensions[0] - start;
                for(m = 0; m < cellsToAdd; ++m) {
                    row.appendChild(this.createCell(start+m, j));
                }
            }
        }
        if(this.context.childElementCount < this.dimensions[1]) {
            rowsToAdd = this.dimensions[1] - this.context.childElementCount;
            start = this.context.childElementCount;
            for(n = 0; n < rowsToAdd; ++n) {
                this.context.appendChild(this.createRow(start+n));
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
            var tr,
                y,
                x;
            for(y = 0; y < this.dimensions[1]; ++y) {
                tr = this.context.rows[y];
                for(x = 0; x < this.dimensions[0]; ++x) {
                    tr.cells[x].classList.add(Mines.getClassForContent(this.board[y][x]));
                }
            }
        }
    }
};

Mines.prototype.restoreBoard = function() {
    this.printBoard();
    var mineState,
        y,
        x;
    for(y = 0; y < this.dimensions[1]; ++y) {
        for(x = 0; x < this.dimensions[0]; ++x) {
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
    var self = this,
        settings = {
            mineCount: self.mineCount,
            board: self.board,
            markedMines: self.markedMines,
            mode: self.mode
        };
    localStorage.setItem("gameSettings", JSON.stringify(settings));
    localStorage.setItem("savedGame", "true");
};

Mines.restoreSavedState = function(cfx) {
    if(Mines.hasSavedState()) {
        var settings = JSON.parse(localStorage.getItem("gameSettings")),
            mines = new Mines(cfx, [ settings.board[0].length, settings.board.length ], settings.mineCount);
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

