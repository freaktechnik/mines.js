const RIGHT = "right",
    TOP = "top",
    LEFT = "left",
    BOTTOM = "bottom";

const combine = (a, b) => {
    if(a == TOP || a == BOTTOM) {
        return a + b;
    }
    else {
        return b + a;
    }
};

const TOPLEFT = combine(TOP, LEFT),
    TOPRIGHT = combine(TOP, RIGHT),
    BOTTOMLEFT = combine(BOTTOM, LEFT),
    BOTTOMRIGHT = combine(BOTTOM, RIGHT);

const DIRECTIONS = [
    RIGHT,
    TOPRIGHT,
    TOP,
    TOPLEFT,
    LEFT,
    BOTTOMLEFT,
    BOTTOM,
    BOTTOMRIGHT
];

const DIR_TO_COORD = {
    [RIGHT]: [ 1, 0 ],
    [TOPRIGHT]: [ 1, -1 ],
    [TOP]: [ 0, -1 ],
    [TOPLEFT]: [ -1, -1 ],
    [LEFT]: [ -1, 0 ],
    [BOTTOMLEFT]: [ -1, 1 ],
    [BOTTOM]: [ 0, 1 ],
    [BOTTOMRIGHT]: [ 1, 1 ]
};

const OPPOSITE_DIRS = {
    [RIGHT]: LEFT,
    [LEFT]: RIGHT,
    [TOP]: BOTTOM,
    [BOTTOM]: TOP,
    [TOPLEFT]: BOTTOMLEFT,
    [BOTTOMLEFT]: TOPLEFT,
    [TOPRIGHT]: BOTTOMRIGHT,
    [BOTTOMRIGHT]: TOPRIGHT
};

export { DIRECTIONS, DIR_TO_COORD, OPPOSITE_DIRS };
