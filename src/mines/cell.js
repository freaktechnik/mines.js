import { Loss } from './error';
import { DIRECTIONS } from './directions';

const SIDES = DIRECTIONS.map((d) => `_${d}`);
const NONE = 0;

export default class Cell {
    constructor({
        x,
        y,
        mine = false,
        channel
    }) {
        this._left = undefined;
        this._right = undefined;
        this._top = undefined;
        this._bottom = undefined;
        this._topleft = undefined;
        this._topright = undefined;
        this._bottomleft = undefined;
        this._bottomright = undefined;
        this.marked = false;
        this.covered = true;
        this._count = null;
        this._cachedSides = null;
        this.x = x;
        this.y = y;
        this.mine = mine;
        this.channel = channel;
    }

    setSide(side, cell) {
        this._cachedSides = null;
        this[`_${side}`] = cell;
    }

    uncover(recursive = true) {
        if(!this.marked) {
            this.covered = false;
            this.channel.emit("uncover", this);
            if(this.mine) {
                this.channel.emit("lost");
                throw new Loss();
            }
            else if(recursive) {
                this._callOnEachNeighbour("uncover");
            }
        }
    }

    calculateCount() {
        this._count = NONE;
        for(const side of this._filteredSides()) {
            if(this[side].mine) {
                ++this._count;
            }
        }
        return this._count;
    }

    markNeighbours() {
        for(const side of this._filteredSides()) {
            if(this[side].covered) {
                this[side].marked = true;
            }
        }
    }

    get count() {
        if(this._count === null) {
            this.calculateCount();
        }
        return this._count;
    }

    get uncoveredNeighbours() {
        let uncoveredNeighbours = NONE;
        for(const side of this._filteredSides()) {
            if(!this[side].covered) {
                ++uncoveredNeighbours;
            }
        }
        return uncoveredNeighbours;
    }

    get markedNeighbours() {
        let markedNeighbours = NONE;
        for(const side of this._filteredSides()) {
            if(this[side].marked) {
                ++markedNeighbours;
            }
        }
        return markedNeighbours;
    }

    get completedNeighbours() {
        let completeNeightbours = NONE;
        for(const side of this._filteredSides()) {
            if(this[side].complete) {
                ++completeNeightbours;
            }
        }
        return completeNeightbours;
    }

    get fullyUncovered() {
        return this.uncoveredNeighbours == this._filteredSides().length - this.count;
    }

    get fullyMarked() {
        return this.markedNeighbours == this.count;
    }

    get fullySurrounded() {
        return this.completedNeightbours == this._filteredSides().length;
    }

    get complete() {
        return !this.covered || this.marked;
    }

    /**
     * Lazily returns all sides that apply to this cell. Caches the result until
     * setSide is called again.
     *
     * @returns {Array.<string>} Filtered sides.
     */
    _filteredSides() {
        if(this._cachedSides === null) {
            this._cachedSides = SIDES.filter((side) => this[side] !== undefined);
        }
        return this._cachedSides;
    }

    _callOnEachNeighbour(funcName, ...args) {
        return this._filteredSides().map((side) => this[side][funcName](...args));
    }
}
