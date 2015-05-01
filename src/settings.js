BoolPreference.TRUE = "enabled";
BoolPreference.FALSE = "disabled";

function BoolPreference(name, defaultValue) {
    this.title = name;
    if(localStorage.getItem(this.title) === null) {
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
    if(localStorage.getItem(this.title) === null) {
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
        var num = parseInt(val, 10);
        if(typeof num == "number" && !isNaN(num))
            localStorage.setItem(this.title, val);
    }
};

// Defaults
var Preferences = {
    autotoggle: new BoolPreference("autotoggle", false),
    vibration : new BoolPreference("vibration", true)
};

