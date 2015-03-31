var mines = document.getElementById("mines"),
    height = document.getElementById("height"),
    width = document.getElementById("width"),
    minesValidator = function(e) {
        var cells = height.valueAsNumber * width.valueAsNumber;
        if(mines.valueAsNumber >= cells && cells >= 2) {
            mines.setCustomValidity(document.querySelector("[data-l10n-id='custom_form_error']").textContent);
        }
        else {
            mines.setCustomValidity("");
        }
};
mines.addEventListener("change", minesValidator, false);
mines.addEventListener("input", minesValidator, false);
mines.addEventListener("invalid", minesValidator, false);

document.getElementById("form").addEventListener("submit", function(e) {
    e.preventDefault();
    minesValidator();
    if(mines.validity.valid)
        document.location = "mines.html#c"+width.value+"x"+height.value+":"+mines.value;
}, false);
document.getElementById("submit").addEventListener("click", function(e) {
    e.preventDefault();
    minesValidator();
    if(mines.validity.valid)       
        document.location = "mines.html#c"+width.value+"x"+height.value+":"+mines.value;
}, false);

document.getElementById("header").addEventListener("action", function(e) {
    document.location = "index.html";
}, false);
