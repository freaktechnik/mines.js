var select = document.getElementById("gametype");
var builtinOptions = ["8x8:10", "16x16:40", "30x16:99"];
var list = document.getElementById("highscores");
var noresults = document.getElementById("noresults");
var strbundle = new StringBundle(document.getElementById("strings"));

function gameDescriptionFromValue(val, callback) {
    var mines = val.split(":");
    var size = mines[0].split("x");
    mines = mines[1];
    strbundle.getStringAsync("highscores_custom_board", { width: size[0], height: size[1], mines: mines }).then(callback);
}

function highscoreListItem(name, time) {
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

function addOption(game, gameDescription) {
    var item = new Option(gameDescription, game);
    select.add(item);
}

Highscores.getGames(function(games) {
    function nextOption(games, i) {
        if(i == games.length) {
            showHighscores(select.value);
        }
        else if(builtinOptions.indexOf(games[i]) == -1) {
            gameDescriptionFromValue(games[i], function(desc) {
                addOption(games[i], desc);
                nextOption(games, i+1);
            });
        }
        else {
            nextOption(games, i+1);
        }
    }

    nextOption(games, 0);
});

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

