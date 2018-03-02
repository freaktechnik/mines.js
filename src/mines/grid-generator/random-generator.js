import getRandomInt from '../../random';
import GridGenerator from './index';

export default class RandomGenerator extends GridGenerator {
    constructor(grid, clickPosition) {
        super(grid, clickPosition);

        let remainingMines = grid.mines,
            x,
            y;
        while(remainingMines > 0) {
            x = getRandomInt(0, grid.width);
            y = getRandomInt(0, grid.height);
            if(!grid.getCell(x, y) && !this.isInEmptyArea(x, y)) {
                grid.addCell(x, y, true);
                --remainingMines;
            }
        }

        grid.fillGrid();
    }
}
