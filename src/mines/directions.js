const RIGHT = "right",
    TOP = "top",
    LEFT = "left",
    BOTTOM = "bottom",
    FORWARD = 1,
    BACKWARD = -1,
    IDENTITY = 0;

const combine = (a, b) => {
    if(a == TOP || a == BOTTOM) {
        return a + b;
    }
    return b + a;
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
    [RIGHT]: [
        FORWARD,
        IDENTITY
    ],
    [TOPRIGHT]: [
        FORWARD,
        BACKWARD
    ],
    [TOP]: [
        IDENTITY,
        BACKWARD
    ],
    [TOPLEFT]: [
        BACKWARD,
        BACKWARD
    ],
    [LEFT]: [
        BACKWARD,
        IDENTITY
    ],
    [BOTTOMLEFT]: [
        BACKWARD,
        FORWARD
    ],
    [BOTTOM]: [
        IDENTITY,
        FORWARD
    ],
    [BOTTOMRIGHT]: [
        FORWARD,
        FORWARD
    ]
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

export {
    DIRECTIONS,
    DIR_TO_COORD,
    OPPOSITE_DIRS
};
