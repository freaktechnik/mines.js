import StringBundle from '../../src/stringbundle';

let nf;
const mines = document.getElementById("mines"),
    height = document.getElementById("height"),
    width = document.getElementById("width"),
    percentage = document.getElementById("percentage"),
    strbundle = new StringBundle(document.getElementById("strings")),
    minesValidator = () => {
        const cells = height.valueAsNumber * width.valueAsNumber;
        if(mines.valueAsNumber >= cells || cells < 2) {
            mines.setCustomValidity(strbundle.getString('custom_form_error'));
        }
        else {
            mines.setCustomValidity("");
        }
    },
    toFixed = (number) => {
        if(nf) {
            return nf.format(number);
        }
        else {
            return number.toFixed(1);
        }
    },
    updateOutput = () => {
        if(mines.value.length && height.value.length && width.value.length) {
            strbundle.getStringAsync(
                "custom_percentage_unit",
                {
                    percentage: toFixed(mines.valueAsNumber / (height.valueAsNumber * width.valueAsNumber) * 100)
                }
            ).then((val) => {
                percentage.value = val;
            });
        }
    },
    listener = () => {
        minesValidator();
        updateOutput();
    },
    submitListener = (e) => {
        e.preventDefault();
        minesValidator();
        if(mines.validity.valid) {
            window.location = `index.html#c${width.value}x${height.value}:${mines.value}`;
        }
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

document.getElementById("form").addEventListener("submit", submitListener, false);
document.getElementById("submit").addEventListener("click", submitListener, false);

updateOutput();
