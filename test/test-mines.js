module("mines.js", {
    beforeEach: function() {
        this.ctx = document.getElementById("field");
        this.mines = new Mines(this.ctx, [8, 8], 10);
    }
});

test("test game over", function(assert) {
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
