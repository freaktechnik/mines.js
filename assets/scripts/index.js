if(Mines.hasSavedState()) {
    document.getElementById("resumeSection").classList.remove("hidden");
    document.getElementById("resumeSection").removeAttribute("hidden");
}

// Show marketplace promo if we're in a Firefox that supports webapps
if(document.getElementById("marketplacepromo") && "mozApps" in navigator) {
    navigator.mozApps.getSelf().then(function(res) {
        // make sure we're not an installed hosted webapp
        if(res === null) {
            document.getElementById("marketplacepromo").removeAttribute("hidden");
        }
    });
}
