import StringBundle from '../../src/stringbundle';

var mines = document.getElementById("mines"),
    height = document.getElementById("height"),
    width = document.getElementById("width"),
    percentage = document.getElementById("percentage"),
    strbundle = new StringBundle(document.getElementById("strings")),
    minesValidator = function() {
        var cells = height.valueAsNumber * width.valueAsNumber;
        if(mines.valueAsNumber >= cells || cells < 2) {
            mines.setCustomValidity(strbundle.getString('custom_form_error'));
        }
        else {
            mines.setCustomValidity("");
        }
    },
    nf,
    toFixed = function(number) {
        if(nf) {
            return nf.format(number);
        }
        else {
            return number.toFixed(1);
        }
    },
    updateOutput = function() {
        if(mines.value.length && height.value.length && width.value.length) {
            strbundle.getStringAsync(
                "custom_percentage_unit",
                {
                    percentage: toFixed(mines.valueAsNumber / (height.valueAsNumber * width.valueAsNumber) * 100)
                }
            ).then(function(val) {
                percentage.value = val;
            });
        }
    },
    listener = function() {
        minesValidator();
        updateOutput();
    };

if("Intl" in window) {
    nf = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 0 });
}

mines.addEventListener("change", listener, false);
mines.addEventListener("input", listener, false);
height.addEventListener("change", listener, false);
height.addEventListener("input", listener, false);
width.addEventListener("change", listener, false);
width.addEventListener("input", listener, false);
mines.addEventListener("invalid", minesValidator, false);

function submitListener(e) {
    e.preventDefault();
    minesValidator();
    if(mines.validity.valid) {
        window.location = `index.html#c${width.value}x${height.value}:${mines.value}`;
    }
}

document.getElementById("form").addEventListener("submit", submitListener, false);
document.getElementById("submit").addEventListener("click", submitListener, false);

updateOutput();
