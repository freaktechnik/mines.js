export default class Preference {
    constructor(type, title, defaultValue = null) {
        this.type = type;
        this.title = title;
        this.defaultValue = defaultValue;
        this.value = defaultValue;
        if(localStorage.getItem(this.title) === null && defaultValue !== null) {
            this.value = this.defaultValue;
        }
    }

    get value() {
        return localStorage.getItem(this.title);
    }

    set value(val) {
        localStorage.setItem(this.title, val);
    }

    reset() {
        this.value = this.defaultValue;
    }
}
