var select = document.getElementById("gametype");
var builtinOptions = ["8x8:10", "16x16:40", "30x16:99"];
var list = document.getElementById("highscores");
var noresults = document.getElementById("noresults");
var strbundle = new StringBundle(document.getElementById("strings"));
if("Intl" in window)
    var nf = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });

function gameDescriptionFromValue(element, val) {
    var mines = val.split(":");
    var size = mines[0].split("x");
    navigator.mozL10n.setAttributes(element, "highscores_custom_board", { width: parseInt(size[0], 10), height: parseInt(size[1], 10), mines: parseInt(mines[1], 10) });
    // Need to explicitly translate it in case it's not inserted into the document yet.
    navigator.mozL10n.translateFragment(element);
}

function highscoreListItem(name, time) {
    if(nf)
        time = nf.format(time);
    else
        time = time.toFixed(2);

    var li = document.createElement("li");
    var divA = document.createElement("div");
    var divB = document.createElement("div");
    var nameNode = document.createTextNode(name);
    var timeNode = document.createTextNode(time+"s");

    li.classList.add("dynamic");
    divA.classList.add("fit");
    divA.classList.add("three");
    divB.classList.add("fit");

    divA.appendChild(nameNode);
    divB.appendChild(timeNode);

    navigator.mozL10n.setAttributes(divB, "mines_time_unit", { time: time });

    li.appendChild(divA);
    li.appendChild(divB);

    return li;
}

function removeDynamicItems() {
    var items = document.querySelectorAll(".dynamic");
    for(var i = 0; i < items.length; ++i) {
        items[i].remove();
    }
}

function showHighscores(game) {
    Highscores.getTop(game, 15, function(tops) {
        removeDynamicItems();
        if(tops.length) {
            noresults.classList.add("hidden");
            noresults.setAttribute("hidden", true);

            tops.forEach(function(top) {
                list.appendChild(highscoreListItem(top.name, top.score));
            });
        }
        else {
            noresults.classList.remove("hidden");
            noresults.removeAttribute("hidden");
        }
    });
}

function addOption(game) {
    var item = new Option(game, game);
    gameDescriptionFromValue(item, game);
    select.add(item);
}

function loadGames() {
    Highscores.getGames(function(games) {
        games.forEach(function(game) {
            if(builtinOptions.indexOf(game) == -1)
                addOption(game);
        });
        showHighscores(select.value);
    });
}

if(!Highscores.ready) {
    document.addEventListener("dbready", loadGames, false);
}
else {
    loadGames();
}

document.getElementById("delete-highscores").addEventListener("click", function() {
    if(window.confirm(strbundle.getString('highscores_confirm_clear'))) {
        Highscores.clear();
        removeDynamicItems();
        noresults.classList.remove("hidden");
        noresults.removeAttribute("hidden");
    }
});

select.addEventListener("change", function(e) {
    showHighscores(select.value);
});

document.getElementById("header").addEventListener("action", function() {
    window.location = "index.html";
}, false);

