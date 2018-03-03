import GridSolver from '.';

const NONE = -1;

/**
 * @implements module:mines/grid-solver
 * @exports module:mines/grid-solver/perfect-solver
 */
export default class PerfectSolver extends GridSolver {
    attemptToSolve() {
        let completed = this.grid.countCompleteCells(),
            prevCompleted = NONE;

        //TODO will need adjustment if solved is true even when not everythong's flagged.

        while(!this.grid.solved && completed != prevCompleted) {
            for(const cell of this.grid.cells) {
                if(cell.covered && cell.fullySurrounded) {
                    //TODO flag or uncover cell or happens via other steps?
                }
                else if(cell.fullyUncovered && !cell.fullyMarked) {
                    cell.markNeighbours();
                }
                else if(!cell.covered && !cell.fullySurrounded) {
                    try {
                        cell.uncover();
                    }
                    catch(e) {
                        return false;
                    }
                }

                //TODO other patterns like 111 and 121.
                //TODO uncover cells if all missing mines are somewhere on the border of the uncovered part of the grid.
            }

            prevCompleted = completed;
            completed = this.grid.countCompleteCells();
        }
        return completed != prevCompleted;
    }
}
