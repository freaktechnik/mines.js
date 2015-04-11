var vibration = localStorage.getItem("vibration");
if(vibration != "enabled" && vibration != "disabled") {
    localStorage.setItem("vibration", "enabled");
    vibration = "enabled";
}

document.getElementById("vibration").checked = vibration == "enabled";

document.getElementById("vibration").addEventListener("change", function(e) {
    if(e.target.checked) {
        localStorage.setItem("vibration", "enabled");
    }
    else {
        localStorage.setItem("vibration", "disabled");
    }
});

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

