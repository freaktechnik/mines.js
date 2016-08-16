export const wait = (interval) => {
    return new Promise((resolve) => {
        setTimeout(resolve, interval);
    });
};

/**
 * Waits for an event at most for 30 seconds.
 *
 * @param {Node} node - Node to listen for an event on.
 * @param {string} event - Name of the event to listen for.
 * @param {boolean} [capturing=false] - If the listener should be capturing.
 * @async
 * @returns {?} Event object passed to the listener.
 */
export const when = (node, event, capturing = false) => {
    return Promise.race([
        new Promise((resolve) => {
            const listener = (e) => {
                node.removeEventListener(event, listener, capturing);
                resolve(e);
            };
            node.addEventListener(event, listener, capturing);
        }),
        wait(30000).then(() => {
            throw new Error("Event listening timed out");
        })
    ]);
};
