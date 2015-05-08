var mines = document.getElementById("mines"),
    height = document.getElementById("height"),
    width = document.getElementById("width"),
    strbundle = new StringBundle(document.getElementById("strings")),
    minesValidator = function(e) {
        var cells = height.valueAsNumber * width.valueAsNumber;
        if(mines.valueAsNumber >= cells || cells < 2) {
            mines.setCustomValidity(strbundle.getString('custom_form_error'));
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
