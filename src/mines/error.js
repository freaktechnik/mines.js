class Loss extends Error {
    constructor() {
        super("Mine was uncovered.");
    }
}

class GridFull extends Error {
    constructor() {
        super("Grid is already full");
    }
}

class NotImplemented extends Error {
    constructor(methodName) {
        super(`Method ${methodName} is not implemented`);
    }
}

export { Loss, GridFull, NotImplemented };
