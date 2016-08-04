import Preferences from '../../src/settings';
import Highscores from '../../src/highscores';

function setupBoolPreference(name) {
    document.getElementById(name).checked = Preferences[name].value;

    document.getElementById(name).addEventListener("change", function(e) {
        Preferences[name].value = e.target.checked;
    }, false);
}

function setupNumberPreference(name) {
    document.getElementById(name).value = Preferences[name].value;

    document.getElementById(name).addEventListener("change", function(e) {
        Preferences[name].value = e.target.value;
    }, false);
}

for(let n in Preferences) {
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

document.querySelector("[data-l10n-id='settings_highscores_clear']").addEventListener("click", () => {
    $("#highscores-clear").openModal();
}, false);

document.getElementById("modal-confirm").addEventListener("click", () => {
    Highscores.clear();
}, false);
