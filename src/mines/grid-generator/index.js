import {
    X,
    Y
} from '../const.json';

export default class GridGenerator {
    constructor(grid, clickPoint) {
        this.clickPoint = clickPoint;
    }

    isInEmptyArea(x, y) {
        return x == this.clickPoint[X] && y == this.clickPoint[Y];
    }
}
