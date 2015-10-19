document.getElementById("header").addEventListener("action", function() {
    window.location = "settings.html";
}, false);

var links = document.querySelector('[role="main"]').addEventListener("click", function(e) {
    if(e.target.tagName.toLowerCase() === "a" && e.target.rel != "source") {
        window.location = "source-viewer.html#" + e.target.href;
        e.preventDefault();
    }
}, true);
