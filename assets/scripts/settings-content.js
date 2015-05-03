function setupBoolPreference(name) {
    document.getElementById(name).checked = Preferences[name].value;

    document.getElementById(name).addEventListener("change", function(e) {
        Preferences[name].value = e.target.checked;
    });
}

function setupNumberPreference(name) {
    document.getElementById(name).value = Preferences[name].value;

    document.getElementById(name).addEventListener("change", function(e) {
        console.log("ping");
        Preferences[name].value = e.target.value;
    });
}

for(var name in Preferences) {
    if(Preferences[name].type == "bool") {
        setupBoolPreference(name);
    }
    else {
        setupNumberPreference(name);
    }
}

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

