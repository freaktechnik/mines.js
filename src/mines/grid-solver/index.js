import { NotImplemented } from '../error';

const NONE = -1;

//TODO make this workerable?
/**
 * @interface
 */
export default class GridSolver {
    constructor(grid) {
        this.grid = grid;
    }

    /**
     * Tries to solve the given grid.
     *
     * @returns {boolean} Whether the attempt to solve succeeded.
     */
    attemptToSolve() {
        let didSolve = true;
        let solved = NONE;

        while(didSolve && solved !== this.grid.cellNumber) {
            didSolve = this.solveStep();
            solved = this.grid.countCompleteCells();
        }
        return solved === this.grid.cellNumber;
    }

    /**
     * Tries to solve one cell in the given grid.
     *
     * @returns {boolean} Whether it succeeded to solve one cell.
     */
    solveStep() {
        throw new NotImplemented("solveStep");
    }
}
