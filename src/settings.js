BoolPreference.TRUE = "enabled";
BoolPreference.FALSE = "disabled";

function BoolPreference(name, defaultValue) {
    this.title = name;
    var pref = localStorage.getItem(name);
    if(pref != BoolPreference.TRUE && pref != BoolPreference.FALSE) {
        this.value = defaultValue;
    }
}
BoolPreference.prototype = {
    type: "bool",
    title: "",
    get value() {
        return localStorage.getItem(this.title) === BoolPreference.TRUE;
    },
    set value(val) {
        localStorage.setItem(this.title, val ? BoolPreference.TRUE : BoolPreference.FALSE);
    }
};

function NumberPreference(name, defaultValue) {
    this.title = name;
    if(isNaN(this.value)) {
        this.value = defaultValue;
    }
}
NumberPreference.prototype = {
    type: "number",
    title: "",
    get value() {
        return parseInt(localStorage.getItem(this.title), 10);
    },
    set value(val) {
        localStorage.setItem(this.title, val);
    }
};

// Defaults
var Preferences = {
    autotoggle: new BoolPreference("autotoggle", false),
    vibration : new BoolPreference("vibration", true)
};

