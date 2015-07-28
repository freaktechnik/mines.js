module("StringBundle", {
    beforeEach: function() {
        this.strbundle = new StringBundle(document.getElementById("strings"));
        this.strings = [
            { id: "mines_restore_error", value: "Saved game is corrupted. Returning to main menu." },
            { id: "mines_new_highscore", value: "Highscore! Please enter your name:" },
            { id: "highscores_custom_board", args: {width: 10, height: 9, mines: 8 }, value: "10x9 with 8 mines" },
            { id: "mines_time_unit", args: {time: "0.0"}, value: "0.0s" }
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

test("async same string", function(assert) {
    var done = assert.async();
    var self = this;
    var args = [
        { arg: "1.23", val: "1.23s" },
        { arg: "0.1", val: "0.1s" },
        { arg: "abc", val: "abcs" }
    ];
    var generator = function(stringargs, i) {
        if(stringargs.length == i) {
            done();
        }
        else {
            self.strbundle.getStringAsync("mines_time_unit", { time: stringargs[i].arg })
                .then(function(val) {
                    assert.equal(val, stringargs[i].val);
                    generator(stringargs, i+1);
                });
        }
    };
    generator(args, 0);
});
