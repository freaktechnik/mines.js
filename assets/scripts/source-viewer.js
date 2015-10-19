document.getElementById("header").addEventListener("action", function() {
    window.location = "licenses.html";
}, false);

var url = location.hash.substr(1);

if(url.indexOf("//") === -1) {
    url = location.protocol + "//" + location.hostname + location.pathname.replace(/[^\/]+/, "") + url;
}

document.querySelector("iframe").src = url;
document.querySelector("#link").href = url;
document.title = url;
document.querySelector("gaia-header h1").textContent = url;
