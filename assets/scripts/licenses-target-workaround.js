document.querySelector('[role="main"]').addEventListener("click", function(e) {
    if(e.target.tagName.toLowerCase() === "a" && e.target.rel != "external") {
        window.location = "source-viewer.html#" + e.target.href;
        e.preventDefault();
    }
}, true);
