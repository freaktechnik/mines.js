module("settings.js", {
    afterEach: function() {
        localStorage.removeItem("bool");
        localStorage.removeItem("number");
    }
});

test("BoolPreference", function(assert) {
    var pref = new BoolPreference("bool", true);

    assert.equal(pref.title, "bool");
    assert.equal(pref.type, "bool");
    assert.equal(typeof pref.value, "boolean");
    assert.ok(pref.value);

    pref.value = false;
    assert.ok(!pref.value);
});

test("NumberPreference", function(assert) {
    var pref = new NumberPreference("number", 7);

    assert.equal(pref.title, "number");
    assert.equal(pref.type, "number");
    assert.equal(typeof pref.value, "number");
    assert.equal(pref.value, 7);

    pref.value = "";
    assert.equal(pref.value, 7);

    pref.value = "0";
    assert.equal(pref.value, 0);
    assert.equal(typeof pref.value, "number");

    pref.value = 1.1;
    assert.equal(pref.value, 1.1);
});

test("Preferences.vibration", function(assert) {
    assert.ok("vibration" in Preferences);
    assert.ok(Preferences.vibration instanceof BoolPreference);
    assert.equal(Preferences.vibration.title, "vibration");
    assert.ok(Preferences.vibration.value, "Vibration default value correct");
});

test("Preferences.autotoggle", function(assert) {
    assert.ok("autotoggle" in Preferences);
    assert.ok(Preferences.autotoggle instanceof BoolPreference);
    assert.equal(Preferences.autotoggle.title, "autotoggle");
    assert.ok(!Preferences.autotoggle.value, "Autotoggle default value correct");
});

test("Preferences.fieldsize", function(assert) {
    assert.ok("fieldsize" in Preferences);
    assert.ok(Preferences.fieldsize instanceof NumberPreference);
    assert.equal(Preferences.fieldsize.title, "fieldsize");
    assert.equal(Preferences.fieldsize.value, 1);
});
