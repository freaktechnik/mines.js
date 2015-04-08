if(Mines.hasSavedState()) {
    document.getElementById("resumeSection").classList.remove("hidden");
    document.getElementById("resumeSection").removeAttribute("aria-hidden");
}

var buttons = document.querySelectorAll(".gaia-list button");
for(var b = 0; b < buttons.length; ++b) {
    buttons[b].addEventListener("click", function(e) {
        if("custom" == e.target.dataset.difficulty) {
            window.location = "custom.html";
        }
        else {
            window.location = "mines.html#"+e.target.dataset.difficulty;
        }
    });
}

