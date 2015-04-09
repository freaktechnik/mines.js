var select = document.getElementById("gametype");
var builtinOptions = ["8x8:10", "16x16:40", "30x16:99"];
var list = document.getElementById("highscores");
var noresults = document.getElementById("noresults");

function gameDescriptionFromValue(val, callback) {
    var mines = val.split(":");
    var size = mines[0].split("x");
    mines = mines[1];
    var string = document.querySelector("[data-l10n-id='highscores_custom_board']");
    navigator.mozL10n.setAttributes(string, "highscores_custom_board", { width: size[0], height: size[1], mines: mines });
    navigator.mozL10n.once(function() {
        callback(string.textContent);
    });
}

function highscoreListItem(name, time) {
    var li = document.createElement("li");
    var divA = document.createElement("div");
    var divB = document.createElement("div");
    var nameNode = document.createTextNode(name);
    var timeNode = document.createTextNode(time);

    li.classList.add("dynamic");
    divA.classList.add("fit");
    divA.classList.add("three");
    divB.classList.add("fit");

    divA.appendChild(nameNode);
    divB.appendChild(timeNode);

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
            tops.forEach(function(top) {
                list.appendChild(highscoreListItem(top.name, top.score));
            });
        }
        else {
            noresults.classList.remove("hidden");
        }
    });
}

function addOption(game, gameDescription) {
    var item = new Option(gameDescription, game);
    select.add(item);
}

Highscores.getGames(function(games) {
    games.forEach(function(game) {
        if(builtinOptions.indexOf(game) == -1) {
            gameDescriptionFromValue(game, addOption.bind(null, game));
        }
    });
    showHighscores(select.value);
});

document.getElementById("delete-highscores").addEventListener("click", function() {
    if(window.confirm(document.querySelector("[data-l10n-id='highscores_confirm_clear']").textContent)) {
        Highscores.clear();
        removeDynamicItems();
        noresults.classList.remove("hidden");
    }
});

select.addEventListener("change", function(e) {
    showHighscores(select.value);
});

document.getElementById("header").addEventListener("action", function() {
    window.location = "index.html";
}, false);

