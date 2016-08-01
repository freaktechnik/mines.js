function BoolPreference(name, defaultValue) {
    this.title = name;
    this.defaultValue = defaultValue;
    if(localStorage.getItem(this.title) === null) {
        this.value = this.defaultValue;
    }
}
BoolPreference.TRUE = "enabled";
BoolPreference.FALSE = "disabled";

BoolPreference.prototype = {
    type: "bool",
    title: "",
    defaultValue: false,
    get value() {
        return localStorage.getItem(this.title) === BoolPreference.TRUE;
    },
    set value(val) {
        localStorage.setItem(this.title, val ? BoolPreference.TRUE : BoolPreference.FALSE);
    },
    reset: function() {
        this.value = this.defaultValue;
    }
};

function NumberPreference(name, defaultValue) {
    this.title = name;
    this.defaultValue = defaultValue;
    if(localStorage.getItem(this.title) === null) {
        this.value = this.defaultValue;
    }
}
NumberPreference.prototype = {
    type: "number",
    title: "",
    defaultValue: 0,
    get value() {
        return parseFloat(localStorage.getItem(this.title), 10);
    },
    set value(val) {
        var num = parseFloat(val, 10);
        if(typeof num == "number" && !isNaN(num)) {
            localStorage.setItem(this.title, val);
        }
    },
    reset: function() {
        this.value = this.defaultValue;
    }
};

// Defaults
var Defaults = {
        autotoggle: {
            type: "bool",
            value: false
        },
        fieldsize: {
            type: "number",
            value: 1
        },
        vibration: {
            type: "bool",
            value: "vibrate" in navigator
        }
    },
    // init prefs
    Preferences = {},
    n;

function getPreference(name) {
    var def = Defaults[name];
    switch(def.type) {
    case "bool":
        return new BoolPreference(name, def.value);
    //case "number":
    default:
        return new NumberPreference(name, def.value);
    }
}


for(n in Defaults) {
    Preferences[n] = getPreference(n);
}

Object.defineProperty(Preferences, "reset", {
    value: function() {
        for(var name in Preferences) {
            Preferences[name].reset();
        }
    }
});

export default Preferences;
