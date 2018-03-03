import Preference from './preference';

const DEFAULT_VALUE = 0;

export default class NumberPreference extends Preference {
    constructor(name, defaultValue = DEFAULT_VALUE) {
        super('number', name, defaultValue);
    }

    get value() {
        return parseFloat(super.value);
    }

    set value(val) {
        const num = parseFloat(val);
        if(typeof num == "number" && !isNaN(num)) {
            super.value = val;
        }
    }
}
