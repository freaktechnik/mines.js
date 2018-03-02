export default class GridGenerator {
    constructor(grid, clickPoint) {
        this.clickPoint = clickPoint;
    }

    isInEmptyArea(x, y) {
        return x == this.clickPoint[0] && y == this.clickPoint[1];
    }
}
