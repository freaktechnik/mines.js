if(Mines.hasSavedState()) {
    document.getElementById("resumeSection").classList.remove("hidden");
    document.getElementById("resumeSection").removeAttribute("hidden");
}

// Show marketplace promo if we're in a Firefox that supports webapps
if(document.getElementById("marketplacepromo") && "mozApps" in navigator) {
    document.getElementById("marketplacepromo").removeAttribute("hidden");
}
