import { NotImplemented } from '../error';

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
        throw new NotImplemented("attemptToSolve");
    }
}
