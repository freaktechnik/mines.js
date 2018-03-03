import BoolPreference from './bool-preference';
import NumberPreference from './number-preference';
import defaults from './defaults.json';

// init prefs
const Preferences = {};

function getPreference(name) {
    const def = defaults[name];
    switch(def.type) {
    case "bool":
        return new BoolPreference(name, def.value);
    //case "number":
    default:
        return new NumberPreference(name, def.value);
    }
}


for(const n in defaults) {
    Preferences[n] = getPreference(n);
}

Object.defineProperty(Preferences, "reset", {
    value() {
        for(const name in Preferences) {
            Preferences[name].reset();
        }
    }
});

export default Preferences;
