import Preference from './preference';

export default class BoolPreference extends Preference {
    static get FALSE() {
        return "disabled";
    }

    static get TRUE() {
        return "enabled";
    }

    constructor(name, defaultValue = false) {
        super('bool', name, defaultValue);
    }

    get value() {
        return super.value === BoolPreference.TRUE;
    }
    set value(val) {
        super.value = val ? BoolPreference.TRUE : BoolPreference.FALSE;
    }
}
