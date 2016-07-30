/**
 * A StringBundle wraps around an HTML element containing nodes with strings used in JS.
 *
 * @param {Element} container - The parent element of all strings.
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
 *
 * @param {string} id - ID of the string to return.
 * @returns {string} Translation of string with the supplied ID.
 */
StringBundle.prototype.getString = function(id) {
    var node = this.getStringContainer(id);
    //navigator.mozL10n.setAttributes(node, id);
    return node.textContent;
};

/**
 * Get the value of a string with a certain ID asynchronously.
 *
 * @param {string} id - ID of the translated string.
 * @param {Object} args - Arguments for variables within the string.
 * @async
 * @returns {string}
 */
StringBundle.prototype.getStringAsync = function(id, args) {
    var node = this.getStringContainer(id);
    var promised = new Promise(function(accept) {
        var tempNode = node.cloneNode();
        navigator.mozL10n.ready(function() {
            navigator.mozL10n.setAttributes(tempNode, id, args);
            navigator.mozL10n.translateFragment(tempNode);
            accept(tempNode.textContent);
        });
    });
    return promised;
};
