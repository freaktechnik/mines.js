/**
 * A StringBundle wraps around an HTML element containing nodes with strings used in JS.
 * @param container: The parent element of all strings.
 */
function StringBundle(container) {
    this.container = container;
    this.container.setAttribute("hidden", true);

    if(!("mozL10n" in navigator)) {
        throw "mozL10n global not initialized.";
    }
}
StringBundle.prototype.container = null;

StringBundle.prototype.getStringContainer = function(id) {
    return this.container.querySelector("[data-l10n-id='"+id+"']");
};

/**
 * Get the value of a string with a certain ID.
 * @param id: ID of the string to return
 * @return Translation of string with the supplied ID
 */
StringBundle.prototype.getString = function(id) {
    var node = this.getStringContainer(id);
    //navigator.mozL10n.setAttributes(node, id);
    return node.textContent;
};

/**
 * Get the value of a string with a certain ID asynchronously.
 * @param id: ID of the translated string
 * @param args: Arguments for variables within the string, should be an object.
 * @return A Promise, resolving with the translation.
 */
StringBundle.prototype.getStringAsync = function(id, args) {
    var node = this.getStringContainer(id);
    var promised = new Promise(function(accept, reject) {
        navigator.mozL10n.once(function() {
            accept(node.textContent);
        });
        navigator.mozL10n.setAttributes(node, id, args);
    });
    return promised;
};
