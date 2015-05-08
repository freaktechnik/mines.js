module("StringBundle", {
    beforeEach: function() {
        this.strbundle = new StringBundle(document.getElementById("strings"));
        this.strings = [
            { id: "mines_restore_error", value: "Saved game is corrupted. Returning to main menu." },
            { id: "mines_new_highscore", value: "Highscore! Please enter your name:" },
            { id: "highscores_custom_board", args: {width: 10, height: 9, mines: 8 }, value: "10x9 with 8 mines" }
        ];
    }
});


test("sync", function(assert) {
    this.strings.forEach(function(string) {
        if(!("args" in string)) {
            assert.equal(this.strbundle.getString(string.id), string.value);
        }
    }, this);
});

test("async", function(assert) {
    var done = assert.async();
    var self = this;

    var testAsync = function(string) {
        var p = self.strbundle.getStringAsync(string.id, string.args).then(function(val) {
            assert.equal(val, string.value);
            return Promise.resolve(true);
        });
        assert.ok(p instanceof Promise);
        return p;
    };

    Promise.all(this.strings.map(testAsync)).then(done);
});
