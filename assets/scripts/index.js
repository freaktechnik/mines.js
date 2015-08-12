if(Mines.hasSavedState()) {
    document.getElementById("resumeSection").classList.remove("hidden");
    document.getElementById("resumeSection").removeAttribute("hidden");
}

var buttons = document.querySelectorAll(".gaia-list button[data-difficulty]");
var listener = function(e) {
        if("custom" == e.target.dataset.difficulty) {
            window.location = "custom.html";
        }
        else {
            window.location = "mines.html#"+e.target.dataset.difficulty;
        }
    };
for(var b = 0; b < buttons.length; ++b) {
    buttons[b].addEventListener("click", listener);
}

// Show marketplace promo if we're in a Firefox that supports webapps
if(document.getElementById("marketplacepromo") && "mozApps" in navigator) {
    document.getElementById("marketplacepromo").removeAttribute("hidden");
}
