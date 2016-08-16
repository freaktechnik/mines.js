import test from 'ava';
import Storage from 'dom-storage';

global.localStorage = new Storage(null);
global.navigator = {};

const Preferences = require('../src/settings').default;
const EXPECTED_PREFS = [ "vibration", "fieldsize", "autotoggle", "autouncover" ];

test.afterEach(() => {
    Preferences.reset();
});

const testBoolPref = (t, pref) => {
    t.is(pref.type, "bool");
    t.is(typeof pref.value, "boolean");
    t.is(pref.value, pref.defaultValue);

    pref.value = false;
    t.false(pref.value);

    pref.reset();
    t.is(pref.value, pref.defaultValue);
};

const testNumberPref = (t, pref) => {
    t.is(pref.type, "number");
    t.is(typeof pref.value, "number");

    pref.value = "";
    t.is(pref.value, pref.defaultValue);

    pref.value = "0";
    t.is(pref.value, 0);
    t.is(typeof pref.value, "number");

    pref.value = 1.1;
    t.is(pref.value, 1.1);

    pref.reset();
    t.is(pref.value, pref.defaultValue);
};

const testPref = (t, pref, name) => {
    if(pref.type == "bool") {
        testBoolPref(t, pref);
    }
    else if(pref.type == "number") {
        testNumberPref(t, pref);
    }
    else {
        t.fail("Invalid pref type for " + name);
    }
};
testPref.title = (providedTitle, pref, name) => `${providedTitle} - ${name}: functionality test`;

const testPrefProperties = (t, pref, name) => {
    t.true(name in Preferences);
    t.is(pref.title, name);
};
testPrefProperties.title = (providedTitle, pref, name) => `${providedTitle} - ${name}: naming`;

EXPECTED_PREFS.forEach((name) => test("Preference anatomy", [ testPref, testPrefProperties ], Preferences[name], name));

test("Preferences.reset()", (t) => {
    Preferences.fieldsize.value = 2;
    Preferences.autotoggle.value = true;
    Preferences.vibration.value = true;
    Preferences.autouncover.value = false;

    Preferences.reset();
    t.is(Preferences.fieldsize.value, Preferences.fieldsize.defaultValue);
    t.false(Preferences.autotoggle.value);
    t.is(Preferences.vibration.value, "vibrate" in navigator);
    t.true(Preferences.autouncover.value);
});
