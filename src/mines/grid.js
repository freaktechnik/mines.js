import Channel from '../channel';
import { GridFull } from './error';
import Cell from './cell';
import { DIR_TO_COORD, OPPOSITE_DIRS } from './directions';

export default class Grid {
    cells = {};

    constructor(height, width, mines) {
        this.height = height;
        this.width = width;
        this.mines = mines;
        this.cells = {};
        this.cellNumber = height * width;
        this._channel = new Channel(this);
    }

    _getCellKey(x, y) {
        return `${x}:${y}`;
    }

    /**
     * Fills the grid up with empty cells.
     */
    fillGrid() {
        for(let x = 0; x < this.height; ++x) {
            for(let y = 0; y < this.width; ++y) {
                if(!(this._getCellKey(x, y) in this.cells)) {
                    this.addCell(x, y);
                }
            }
        }
    }

    getCell(x, y) {
        return this.cells[this._getCellKey(x, y)];
    }

    _getCellInDir(x, y, direction) {
        const ops = DIR_TO_COORD[direction];
        return this.getCell(x + ops[0], y + ops[1]);
    }

    _linkCells(cellA, cellB, direction) {
        cellA.setSide(direction, cellB);
        cellB.setSide(OPPOSITE_DIRS[direction], cellA);
    }

    addCell(x, y, mine = false) {
        if(this.cells.length < this.cellNumber) {
            const key = this._getCellKey(x, y),
                cell = new Cell({
                    x,
                    y,
                    mine,
                    channel: this._channel
                });

            let siblingCell;
            for(const dir in DIR_TO_COORD) {
                siblingCell = this._getCellInDir(x, y, dir);
                if(siblingCell) {
                    this._linkCells(cell, siblingCell, dir);
                }
            }

            this.cells[key] = cell;
            return cell;
        }
        else {
            throw new GridFull();
        }
    }

    countMines() {
        let mines = 0;
        for(const cell of this.cells) {
            if(cell.mine) {
                ++mines;
            }
        }
        return mines;
    }

    countFlags() {
        let flags = 0;
        for(const cell of this.cells) {
            if(cell.marked) {
                ++flags;
            }
        }

        return flags;
    }

    countCompleteCells() {
        let complete = 0;
        for(const cell of this.cells) {
            if(cell.complete) {
                ++complete;
            }
        }

        return complete;
    }

    countUncovered() {
        let uncovered = 0;
        for(const cell if this.cells) {
            if(!cell.covered) {
                ++uncovered;
            }
            if(uncovered + this.mines == this.cellNumber) {
                return uncovered;
            }
        }
        return uncovered;
    }

    get valid() {
        return Object.keys(this.cells).length == this.cellNumber && this.mines == this.countMines();
    }

    get solved() {
        return this.countUncovered() == this.cellNumber - this.mines;
    }

    /**
     * Channel Listener implementation.
     *
     * @param {string} event - Event name that was sent to the channel.
     * @param {?} data - Data the other side sent along.
     */
    onMessage(event, data) {
        console.warn(event, data);
        //TODO do stuff
    }
}
