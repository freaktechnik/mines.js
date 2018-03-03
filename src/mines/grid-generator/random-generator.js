import getRandomInt from '../../random';
import GridGenerator from '.';

const NONE = 0;
const ORIGIN = 0;

export default class RandomGenerator extends GridGenerator {
    constructor(grid, clickPosition) {
        super(grid, clickPosition);

        let remainingMines = grid.mines,
            x,
            y;
        while(remainingMines > NONE) {
            x = getRandomInt(ORIGIN, grid.width);
            y = getRandomInt(ORIGIN, grid.height);
            if(!grid.getCell(x, y) && !this.isInEmptyArea(x, y)) {
                grid.addCell(x, y, true);
                --remainingMines;
            }
        }

        grid.fillGrid();
    }
}
