import Preferences from '../../src/settings';
import StringBundle from '../../src/stringbundle';
import Highscores from '../../src/highscores';

function setupBoolPreference(name) {
    document.getElementById(name).checked = Preferences[name].value;

    document.getElementById(name).addEventListener("change", function(e) {
        Preferences[name].value = e.target.checked;
    });
}

function setupNumberPreference(name) {
    document.getElementById(name).value = Preferences[name].value;

    document.getElementById(name).addEventListener("change", function(e) {
        Preferences[name].value = e.target.value;
    });
}

var strbundle = new StringBundle(document.getElementById("strings")),
    n;

for(n in Preferences) {
    if(Preferences[n].type == "bool") {
        setupBoolPreference(n);
    }
    else {
        setupNumberPreference(n);
    }
}

if(!navigator.vibrate) {
    document.getElementById("vibration").setAttribute("disabled", true);
}

document.querySelector("[data-l10n-id='settings_highscores_clear']").addEventListener("click", function() {
    if(window.confirm(strbundle.getString("highscores_confirm_clear"))) {
        Highscores.clear();
    }
});

