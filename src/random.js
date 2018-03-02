/**
 * From MDN.
 *
 * @param {number} min - Inclusive minimum for the random number.
 * @param {number} max - Exclusive maximum for the random number.
 * @returns {number} Random number within the given bounds.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#Example:_Using_Math.random}
 */
export default function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
