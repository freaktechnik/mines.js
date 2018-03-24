import GridSolver from '.';

/**
 * @exports module:mines/grid-solver/perfect-solver
 */
export default class PerfectSolver extends GridSolver {
    solveStep() {
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
        //TODO return true sometimes.
        return false;
    }
}
