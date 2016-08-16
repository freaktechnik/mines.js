import test from 'ava';
import setup from './helpers/setup-browser-env';
import Mines from '../src/mines';
import { when } from './helpers/wait';

test.before(() => {
    return setup();
});
test.beforeEach((t) => {
    const parent = document.createElement("div");
    parent.setAttribute("aria-busy", "true");
    t.context.ctx = document.createElement("table");
    parent.appendChild(t.context.ctx);
    t.context.mines = new Mines(t.context.ctx, [ 8, 8 ], 10);
});

test("construction", (t) => {
    t.is(t.context.mines.context, t.context.ctx);
    t.is(t.context.mines.dimensions[0], 8);
    t.is(t.context.mines.dimensions[1], 8);
    t.is(t.context.mines.mineCount, 10);
    t.false(t.context.mines.done);
    t.is(t.context.mines.board.length, t.context.mines.dimensions[1]);
    t.is(t.context.mines.markedMines.length, t.context.mines.dimensions[1]);
    t.is(t.context.mines.mode, Mines.MODE_UNCOVER);
    t.false(t.context.mines.boardGenerated);
    t.false(Mines.hasSavedState());
    t.false(t.context.ctx.parentNode.hasAttribute("aria-busy"));
});

test("toggle mode", async (t) => {
    t.is(t.context.mines.mode, Mines.MODE_UNCOVER);
    t.context.mines.toggleMode();
    t.is(t.context.mines.mode, Mines.MODE_FLAG);
    const promise = when(t.context.ctx, "modetoggle");
    t.context.mines.toggleMode();
    await promise;
    t.is(t.context.mines.mode, Mines.MODE_UNCOVER);
});

test("generate", async (t) => {
    t.false(t.context.mines.boardGenerated);

    const promise = when(t.context.ctx, "generated");
    t.context.mines.generate([ 1, 1 ]);
    await promise;
    t.true(t.context.mines.boardGenerated);
    t.not(t.context.mines.board[1][1], Mines.MINE);
    //TODO check if generated board is valid
    //TODO check the print
});

test("count flags", async (t) => {
    t.is(t.context.mines.countFlags(), 0);
    t.context.mines.flagCell(0, 0);
    t.is(t.context.mines.countFlags(), 0, "Shortcutting, if the board is not yet generated");
    t.is(t.context.mines.cellIsFlagged(0, 0), 1, "Cell is actually flagged, just not counted");
    t.context.mines.flagCell(0, 0);
    t.is(t.context.mines.cellIsFlagged(0, 0), 0, "Cell was unflagged");

    let promise = when(t.context.ctx, "generated");
    t.context.mines.generate([ 1, 1 ]);
    await promise;

    t.is(t.context.mines.countFlags(), 0, "Count no flagged cell yet");
    t.is(t.context.mines.cellIsFlagged(0, 0), 0);

    promise = when(t.context.ctx, "flagged");
    t.context.mines.flagCell(0, 0);
    await promise;

    t.is(t.context.mines.countFlags(), 1, "Count one flagged cell");
    t.is(t.context.mines.cellIsFlagged(0, 0), 1);

    promise = when(t.context.ctx, "unflagged");
    t.context.mines.flagCell(0, 0);
    await promise;

    t.is(t.context.mines.countFlags(), 0, "Count no flagged cell anymore");
    t.is(t.context.mines.cellIsFlagged(0, 0), 0);
});

test("game over", async (t) => {
    const promise = when(t.context.ctx, "loose");
    t.context.mines.gameOver();
    await promise;
    t.context.ctx.removeEventListener("loose", t.context);

    t.true(t.context.mines.done);
    t.true(t.context.ctx.className.includes("gameover"));
    t.true(t.context.ctx.className.includes("done"));
});

test("win", async (t) => {
    const promise = when(t.context.ctx, "win");
    t.context.mines.win();
    await promise;

    t.true(t.context.mines.done);
    t.true(t.context.ctx.className.includes("done"));
});

test("saving", (t) => {
    t.false(Mines.hasSavedState());
    t.context.mines.saveState();
    t.true(Mines.hasSavedState());

    const restored = Mines.restoreSavedState(t.context.ctx);
    t.is(t.context.mines.mineCount, restored.mineCount, "Restored mine count matches");
    t.is(t.context.mines.dimensions[0], restored.dimensions[0], "Restored dimension 1 matches");
    t.is(t.context.mines.dimensions[1], restored.dimensions[1], "Restored dimension 2 matches");
    t.is(t.context.mines.mode, restored.mode, "Restored mode matches");
    t.is(t.context.mines.board.length, restored.board.length, "Restored board size matches");
    t.is(t.context.mines.countFlags(), restored.countFlags(), "Restored flag count matches");
    t.is(t.context.mines.nonMinesCovered(), restored.nonMinesCovered(), "Restored mine coverage matches");

    Mines.removeSavedState();
    t.false(Mines.hasSavedState());
});

test("reset without mods", async (t) => {
    const promise = when(t.context.ctx, "reset");
    t.context.mines.reset();
    await promise;

    t.false(t.context.mines.done);
    t.is(t.context.mines.countFlags(), 0);
    t.false(Mines.hasSavedState());
    t.is(t.context.mines.mode, Mines.MODE_UNCOVER);
});

test("reset in progress", async (t) => {
    t.context.mines.generate([ 1, 1 ]);
    t.context.mines.toggleMode();
    t.context.mines.saveState();
    t.context.mines.flagCell(5, 4);

    const promise = when(t.context.ctx, "reset");
    t.context.mines.reset();
    await promise;

    t.false(t.context.mines.done);
    t.is(t.context.mines.countFlags(), 0);
    t.false(Mines.hasSavedState());
    t.is(t.context.mines.mode, Mines.MODE_UNCOVER);
});

test("reset loss", async (t) => {
    let promise = when(t.context.ctx, "loose");
    t.context.mines.gameOver();
    await promise;

    promise = when(t.context.ctx, "reset");
    t.context.mines.reset();
    await promise;

    t.false(t.context.mines.done);
    t.is(t.context.mines.countFlags(), 0);
    t.false(Mines.hasSavedState());
    t.is(t.context.mines.mode, Mines.MODE_UNCOVER);
});

test("reset win", async (t) => {
    let promise = when(t.context.ctx, "win");

    t.context.mines.win();
    await promise;

    promise = when(t.context.ctx, "reset");
    t.context.mines.reset();
    await promise;

    t.false(t.context.mines.done);
    t.is(t.context.mines.countFlags(), 0);
    t.false(Mines.hasSavedState());
    t.is(t.context.mines.mode, Mines.MODE_UNCOVER);
});
