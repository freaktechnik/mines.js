BoolPreference.TRUE = "enabled";
BoolPreference.FALSE = "disabled";
BoolPreference.prototype.value = false;
function BoolPreference(name, defaultValue) {
    var pref = localStorage.getItem(name);
    if(pref != BoolPreference.TRUE && pref != BoolPreference.FALSE) {
        localStorage.setItem(name, defaultValue);
        pref = defaultValue;
    }

    document.getElementById(name).checked = pref == BoolPreference.TRUE;

    document.getElementById(name).addEventListener("change", function(e) {
        if(e.target.checked) {
            localStorage.setItem(name, BoolPreference.TRUE);
        }
        else {
            localStorage.setItem(name, BoolPreference.FALSE);
        }
    });
}

BoolPreference("vibration", BoolPreference.TRUE);
BoolPreference("autotoggle", BoolPreference.FALSE);

document.querySelector("[data-l10n-id='settings_highscores_clear']").addEventListener("click", function() {
    if(window.confirm(document.querySelector("[data-l10n-id='highscores_confirm_clear']").textContent)) {
        Highscores.clear();
        removeDynamicItems();
        noresults.classList.remove("hidden");
    }
});

document.getElementById("header").addEventListener("action", function() {
    window.location = "index.html";
}, false);

