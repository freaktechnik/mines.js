module("mines.js", {
    beforeEach: function() {
        this.ctx = document.getElementById("field");
        this.mines = new Mines(this.ctx, [8, 8], 10);
    }
});

test("construction", function(assert) {
    assert.equal(this.mines.context, this.ctx);
    assert.equal(this.mines.dimensions[0], 8);
    assert.equal(this.mines.dimensions[1], 8);
    assert.equal(this.mines.mineCount, 10);
    assert.ok(!this.mines.done);
    assert.equal(this.mines.board.length, this.mines.dimensions[1]);
    assert.equal(this.mines.markedMines.length, this.mines.dimensions[1]);
    assert.equal(this.mines.mode, Mines.MODE_UNCOVER);
    assert.ok(!this.mines.boardGenerated);
    assert.ok(!Mines.hasSavedState());
});

test("toggle mode", function(assert) {
    var done = assert.async();
    var self = this;

    assert.equal(this.mines.mode, Mines.MODE_UNCOVER);
    this.mines.toggleMode();
    assert.equal(this.mines.mode, Mines.MODE_FLAG);
    this.ctx.addEventListener("modetoggle", function() {
        assert.equal(self.mines.mode, Mines.MODE_UNCOVER);
        done();
    });
    this.mines.toggleMode();
});

test("generate", function(assert) {
    var done = assert.async();
    var self = this;

    assert.ok(!this.mines.boardGenerated);

    this.ctx.addEventListener("generated", function() {
        assert.ok(self.mines.boardGenerated);
        assert.notEqual(self.mines.board[1][1], Mines.MINE);
        //TODO check if generated board is valid
        //TODO check the print
        done();
    });
    this.mines.generate([1, 1]);
});

test("count flags", function(assert) {
    var done = assert.async();
    var self = this;

    assert.equal(this.mines.countFlags(), 0);
    this.mines.flagCell(0, 0);
    assert.equal(this.mines.countFlags(), 0, "Shortcutting, if the board is not yet generated");
    assert.equal(this.mines.cellIsFlagged(0, 0), 1, "Cell is actually flagged, just not counted");
    this.mines.flagCell(0, 0);
    assert.equal(this.mines.cellIsFlagged(0, 0), 0, "Cell was unflagged");

    this.ctx.addEventListener("generated", function() {
        self.ctx.removeEventListener("generated", this);

        assert.equal(self.mines.countFlags(), 0, "Count no flagged cell yet");
        assert.equal(self.mines.cellIsFlagged(0, 0), 0);

        self.ctx.addEventListener("flagged", function() {
            self.ctx.removeEventListener("flagged", this);

            assert.equal(self.mines.countFlags(), 1, "Count one flagged cell");
            assert.equal(self.mines.cellIsFlagged(0, 0), 1);

            self.mines.flagCell(0, 0);
        });

        self.ctx.addEventListener("unflagged", function() {
            self.ctx.removeEventListener("unflagged", this);

            assert.equal(self.mines.countFlags(), 0, "Count no flagged cell anymore");
            assert.equal(self.mines.cellIsFlagged(0, 0), 0);

            done();
        });

        self.mines.flagCell(0, 0);

    });

    this.mines.generate([1, 1]);
});

test("game over", function(assert) {
    assert.expect(3);
    var done = assert.async();
    var self = this;
    this.ctx.addEventListener("loose", function() {
        self.ctx.removeEventListener("loose", this);

        assert.ok(self.mines.done);
        assert.ok(self.ctx.className.indexOf("gameover")!=-1);
        assert.ok(self.ctx.className.indexOf("done")!=-1);

        done();
    }, false);
    this.mines.gameOver();
});

test("win", function(assert) {
    var done = assert.async();
    var self = this;
    this.ctx.addEventListener("win", function() {
        self.ctx.removeEventListener("win", this);

        assert.ok(self.mines.done);
        assert.ok(self.ctx.className.indexOf("done") != -1);

        done();
    }, false);
    this.mines.win();
});

test("saving", function(assert) {
    assert.ok(!Mines.hasSavedState());
    this.mines.saveState();
    assert.ok(Mines.hasSavedState());

    var restored = Mines.restoreSavedState(this.ctx);
    assert.equal(this.mines.mineCount, restored.mineCount);
    assert.equal(this.mines.dimensions[0], restored.dimensions[0]);
    assert.equal(this.mines.dimensions[1], restored.dimensions[1]);
    assert.equal(this.mines.mode, restored.mode);
    assert.equal(this.mines.board.length, restored.board.length);
    assert.equal(this.mines.countFlags(), restored.countFlags());
    assert.equal(this.mines.nonMinesCovered(), restored.nonMinesCovered());

    Mines.removeSavedState();
    assert.ok(!Mines.hasSavedState());
});
