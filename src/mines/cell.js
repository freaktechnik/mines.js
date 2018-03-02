import { Loss } from './error';
import { DIRECTIONS } from './directions';

const SIDES = DIRECTIONS.map((d) => "_" + d);

export default class Cell {
    mine = false;
    _left = undefined;
    _right = undefined;
    _top = undefined;
    _bottom = undefined;
    _topleft = undefined;
    _topright = undefined;
    _bottomleft = undefined;
    _bottomright = undefined;
    marked = false;
    covered = true;
    _count = null;
    _cachedSides = null;

    constructor({ x, y, mine, channel }) {
        this.x = x;
        this.y = y;
        this.mine = mine;
        this.channel = channel;
    }

    /**
     * Lazily returns all sides that apply to this cell. Caches the result until
     * setSide is called again.
     *
     * @returns {Array.<string>}
     */
    _filteredSides() {
        if(this._cachedSides === null) {
            this._cachedSides = SIDES.filter((side) => this[side] !== undefined);
        }
        return this._cachedSides;
    }

    _callOnEachNeighbour(funcName, ...args) {
        return this._filteredSides().map((side) => {
            return this[side][funcName](...args);
        });
    }

    setSide(side, cell) {
        this._cachedSides = null;
        this["_" + side] = cell;
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
        this._count = 0;
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
        let uncoveredNeighbours = 0;
        for(const side of this._filteredSides()) {
            if(!this[side].covered) {
                ++uncoveredNeighbours;
            }
        }
        return uncoveredNeighbours;
    }
    
    get markedNeighbours() {
        let markedNeighbours = 0;
        for(const side of this._filteredSides()) {
            if(this[side].marked) {
                ++markedNeighbours;
            }
        }
        return markedNeighbours;
    }

    get completedNeighbours() {
        let completeNeightbours = 0;
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
}
