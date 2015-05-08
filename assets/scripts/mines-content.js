const UNCOVER = "mines_mode_uncover";
const FLAG = "mines_mode_flag";
const UNCOVER_ICON = "brightness";
const FLAG_ICON = "flag";

// Execute an asynchonous vibration if it's enabled
function vibrate(time) {
    if("vibrate" in navigator && Preferences.vibration.value)
        setTimeout(function() { navigator.vibrate(time); }, 0);
}

function deleteSave() {
    Mines.removeSavedState();
    localStorage.setItem("savedTime", "false");
    localStorage.setItem("time", "0");
}

function getMinesFromHash(hash, field) {
    if(hash.charAt(0) == "r") {
        var mines = Mines.restoreSavedState(field);
        if(!mines) {
            window.alert(document.querySelector("[data-l10n-id='mines_restore_error']").textContent);
            Mines.removeSavedState();
            window.location = "index.html";
        }
        else {
            if(mines.mode == Mines.MODE_FLAG) {
                toggleMode();
            }
            return mines;
        }
    }
    else {
        deleteSave();
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

function gameDescriptionFromMines(mines) {
    return mines.dimensions[0]+"x"+mines.dimensions[1]+":"+mines.mineCount;
}

function toggleMode() {
    var button = document.getElementById("flagtoggle");
    var l10nAttrs = navigator.mozL10n.getAttributes(button);

    if(l10nAttrs.id == UNCOVER) {
        navigator.mozL10n.setAttributes(button, FLAG);
        button.dataset.icon = FLAG_ICON;
    }
    else {
        navigator.mozL10n.setAttributes(button, UNCOVER);
        button.dataset.icon = UNCOVER_ICON;
    }
}

var field = document.getElementById("field"),
    output = document.getElementById("minecount"),
    mines = getMinesFromHash(document.location.hash.substr(1), field),
    time = 0;

output.value = mines.mineCount - mines.countFlags();

mines.setSize(Preferences.fieldsize.value);

if(localStorage.getItem("savedTime") == "true") {
    time = parseInt(localStorage.getItem("time"), 10);
    localStorage.setItem("savedTime", "false");
    localStorage.setItem("time", "0");
}
var timer = new Timer(time, document.getElementById("time"));
if(time !== 0) {
    timer.start();
}

// Event listeners

field.addEventListener("modetoggle", toggleMode);

document.getElementById("reset").addEventListener("click", function() {
    mines.reset();
}, false);

field.addEventListener("generated", function() {
    timer.start();
    if(Preferences.autotoggle.value) {
        mines.toggleMode();
    }
});

field.addEventListener("loose", function() {
    timer.pause();
    vibrate(500);
});

field.addEventListener("win", function() {
    timer.pause();
    var game = gameDescriptionFromMines(mines);
    var time = timer.getTime()/1000.0;
    Highscores.isNewTop(game, time, function(newTop) {
        if(newTop) {
            var lastUser = localStorage.getItem("highscoreUser");
            if(lastUser === null)
                lastUser = "";
            var user = window.prompt(document.querySelector("[data-l10n-id='mines_new_highscore']").textContent, lastUser);
            if(user) {
                localStorage.setItem("highscoreUser", user);
                Highscores.save(game, time.toFixed(2), user);
            }
        }
    });
});

field.addEventListener("reset", function() {
    timer.reset();
    var flagtoggle = document.getElementById("flagtoggle");
    navigator.mozL10n.setAttributes(flagtoggle, UNCOVER);
    flagtoggle.dataset.icon = UNCOVER_ICON;
    output.value = mines.mineCount;
}, false);

field.addEventListener("flagged", function() {
    var id = navigator.mozL10n.getAttributes(document.getElementById("flagtoggle")).id;
    if(id == UNCOVER)
        vibrate(20);
    output.value = parseInt(output.value, 10) - 1;
}, false);

field.addEventListener("unflagged", function() {
    var id = navigator.mozL10n.getAttributes(document.getElementById("flagtoggle")).id;
    if(id == UNCOVER)
        vibrate(20);
    output.value = parseInt(output.value, 10) + 1;
}, false);

document.getElementById("flagtoggle").addEventListener("click", function(e) {
    mines.toggleMode();
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

// Scaling on mobile (since desktop browsers don't let us override it anyways, so nobody complain, k?)

var hammer = new Hammer.Manager(mines.context);
// enable all touch actions so we still get scrolling and the click events
hammer.set({ touchAction: "auto" });

var pinch = new Hammer.Pinch({ threshold: 0 });

hammer.add(pinch);

var initialSize = Preferences.fieldsize.value;

hammer.on("pinchstart", function(e) {
    initialSize = mines.size;
});

hammer.on("pinch", function(e) {
    mines.setSize(initialSize * e.scale);
});

