module("timer.js", {
    beforeEach: function() {
        this.output = document.getElementById("output");
        this.output.value = "";
        this.delta = 50;
    }
});

test("Setup", function(assert) {
    assert.expect(3);
    var t = new Timer(10, this.output);
    assert.equal(t.offset, 10);
    assert.equal(t.output, this.output);
    assert.ok(!t.running);
});

test("start", function(assert) {
    var t = new Timer(0, this.output);
    t.start();
    assert.ok(t.running);
    assert.notEqual(t.startTime, 0);
    t.stop();
});

test("start event", function(assert) {
    var done = assert.async();
    var t = new Timer(0, this.output);
    this.output.addEventListener("start", function() {
        assert.push("Start event fired");
        t.stop();
        done();
    });
    t.start();
});

test("pause", function(assert) {
    var done = assert.async();
    var t = new Timer(0, this.output);
    var self = this;
    t.start();
    setTimeout(function() {
        t.pause();
        assert.ok(!t.running);
        assert.ok(Math.abs(t.offset - 1000) < self.delta);
        done();
    }, 1000);
});

test("pause event", function(assert) {
    var done = assert.async();
    var t = new Timer(0, this.output);
    t.start();
    this.output.addEventListener("pause", function(e) {
        assert.equal(t.offset, e.detail);
        done();
    });
    setTimeout(function() {
        t.pause();
    }, 1000);
});

test("updateOutput", function(assert) {
    var done = assert.async();
    var t = new Timer(0, this.output);
    t.start();
    setTimeout(function() {
        t.pause();
        t.updateOutput();
        assert.equal(t.output.value, "1.0");
        t.updateOutput(1100);
        assert.equal(t.output.value, "1.1");
        done();
    }, 1000);
});

test("stop", function(assert) {
    var t = new Timer(0, this.output);
    t.start();
    t.stop();
    assert.ok(!t.running);
    assert.equal(t.startTime, 0);
    assert.equal(t.offset, 0);
    assert.equal(this.output.value, "0.0");
});

test("stop event", function(assert) {
    var done = assert.async();
    var t = new Timer(0, this.output);
    t.start();
    this.output.addEventListener("stop", function(e) {
        assert.notEqual(e.detail, 0);
        done();
    });
    setTimeout(function() {
        t.stop();
    }, 100);
});

test("getTime", function(assert) {
    var t = new Timer(10, this.output);
    assert.equal(t.getTime(), 10);
    t.running = true;
    assert.equal(t.getTime(), Date.now());
    t.running = false;
});

test("reset", function(assert) {
    var t = new Timer(0, this.output);
    t.start();
    t.reset();
    assert.ok(!t.running);
    assert.equal(t.startTime, 0);
    assert.equal(t.offset, 0);
    assert.equal(this.output.value, "0.0");
});

test("reset event", function(assert) {
    var done = assert.async();
    var t = new Timer(0, this.output);
    this.output.addEventListener("reset", function() {
        assert.push("Reset event fired");
        done();
    });
    t.reset();
});

