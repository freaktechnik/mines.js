function getMinesFromHash(hash, field) {
    if(hash.charAt(0) == "r") {
        var mines = Mines.restoreSavedState(field);
        if(!mines) {
            window.alert(document.querySelector("[data-l10n-id='mines_restore_error']").textContent);
            Mines.removeSavedState();
            window.location = "index.html";
        }
        else {
            return mines;
        }
    }
    else {
        var preset;
        if(hash.charAt(0) == "c") {
            var vals = hash.match(/^c([0-9]+)x([0-9]+):([0-9]+)/);
            preset = { size: [parseInt(vals[1], 10), parseInt(vals[2], 10)], mines: parseInt(vals[3], 10) };
        }
        else {
            preset = Mines.defaultBoards[hash];
        }
        return new Mines(field, preset.size, preset.mines);
    }
}

var preset = document.location.hash.substr(1),
    field = document.getElementById("field"),
    output = document.getElementById("minecount"),
    mines = getMinesFromHash(preset, field);

const UNCOVER = "mines_mode_uncover";
const FLAG = "mines_mode_flag";
const UNCOVER_ICON = "brightness";
const FLAG_ICON = "flag";

output.value = mines.mineCount - mines.countFlags();

document.getElementById("reset").addEventListener("click", function() {
    mines.reset();
}, false);

var time = 0;
if(localStorage.getItem("savedTime") == "true") {
    time = parseInt(localStorage.getItem("time"), 10);
    localStorage.setItem("savedTime", "false");
    localStorage.setItem("time", "0");
}
var timer = new Timer(time, document.getElementById("time"));
if(time !== 0) {
    timer.start();
}

field.addEventListener("generated", function() {
    timer.start();
});

field.addEventListener("loose", function() {
    timer.pause();
    window.navigator.vibrate(1500);
});

field.addEventListener("win", function() {
    timer.pause();
});

field.addEventListener("reset", function() {
    timer.reset();
    document.getElementById("flagtoggle").dataset.l10nId = UNCOVER;
    document.getElementById("flagtoggle").dataset.icon = UNCOVER_ICON;
    output.value = mines.mineCount;
}, false);

field.addEventListener("flagged", function() {
    window.navigator.vibrate(100);
    output.value = parseInt(output.value, 10) - 1;
}, false);

field.addEventListener("unflagged", function() {
    window.navigator.vibrate(100);
    output.value = parseInt(output.value, 10) + 1;
}, false);

document.getElementById("flagtoggle").addEventListener("click", function(e) {
    mines.toggleMode();
    if(e.currentTarget.dataset.l10nId == UNCOVER) {
        e.currentTarget.dataset.l10nId = FLAG;
        e.currentTarget.dataset.icon = FLAG_ICON;
    }
    else {
        e.currentTarget.dataset.l10nId = UNCOVER;
        e.currentTarget.dataset.icon = UNCOVER_ICON;
    }
}, false);

window.addEventListener("beforeunload", function() {
    if(!mines.done && mines.boardGenerated) {
        localStorage.setItem("time", timer.stop());
        localStorage.setItem("savedTime", "true");
        mines.saveState();
    }
}, false);

document.getElementById("header").addEventListener("action", function() {
    window.location = "index.html";
}, false);
