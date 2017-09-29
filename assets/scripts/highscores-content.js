import Highscores from '../../src/highscores';

let nf;
const DIM_X = 0,
    DIM_Y = 1,
    TWO_DIGITS = 2,
    HIGHSCORE_COUNT = 15,
    select = document.getElementById("gametype"),
    builtinOptions = [
        "8x8:10",
        "16x16:40",
        "30x16:99"
    ],
    list = document.getElementById("highscores"),
    noresults = document.getElementById("noresults"),
    updateSelect = () => {
        $('select').material_select();
    };

if("Intl" in window) {
    nf = new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    });
}

function gameDescriptionFromValue(element, val) {
    const mines = val.split(":"),
        size = mines[DIM_X].split("x");
    navigator.mozL10n.setAttributes(element, "highscores_custom_board", {
        width: parseInt(size[DIM_X], 10),
        height: parseInt(size[DIM_Y], 10),
        mines: parseInt(mines[DIM_Y], 10)
    });
    // Need to explicitly translate it in case it's not inserted into the document yet.
    navigator.mozL10n.translateFragment(element);
}

function highscoreListItem(name, time) {
    if(nf) {
        time = nf.format(time);
    }
    else {
        time = time.toFixed(TWO_DIGITS);
    }

    const li = document.createElement("li"),
        divA = document.createElement("span"),
        divB = document.createElement("span"),
        nameNode = document.createTextNode(name),
        timeNode = document.createTextNode(`${time}s`);

    li.classList.add("dynamic");
    li.classList.add("collection-item");
    divB.classList.add("badge");

    divA.appendChild(nameNode);
    divB.appendChild(timeNode);

    navigator.mozL10n.setAttributes(divB, "mines_time_unit", { time });

    li.appendChild(divA);
    li.appendChild(divB);

    return li;
}

function removeDynamicItems() {
    const items = document.querySelectorAll(".dynamic");
    for(const i of items) {
        i.remove();
    }
}

function showHighscores(game) {
    Highscores.getTop(game, HIGHSCORE_COUNT, (tops) => {
        removeDynamicItems();
        if(tops.length) {
            noresults.classList.add("hidden");
            noresults.setAttribute("hidden", true);

            tops.forEach((top) => {
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
    const item = new Option(game, game);
    gameDescriptionFromValue(item, game);
    select.add(item);
}

function loadGames() {
    Highscores.getGames((games) => {
        games.forEach((game) => {
            if(builtinOptions.includes(game)) {
                addOption(game);
            }
        });
        updateSelect();
        showHighscores(select.value);
    });
}


$(document).ready(updateSelect);
navigator.mozL10n.ready(updateSelect);

if(!Highscores.ready) {
    document.addEventListener("dbready", loadGames, false);
}
else {
    loadGames();
}

document.getElementById("modal-confirm").addEventListener("click", () => {
    Highscores.clear();
    removeDynamicItems();
    noresults.classList.remove("hidden");
    noresults.removeAttribute("hidden");
}, false);

document.getElementById("delete-highscores").addEventListener("click", () => {
    $("#highscores-clear").openModal();
}, false);

$('select').on('change', () => {
    showHighscores(select.value);
});
