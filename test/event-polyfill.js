window.Event = function Event(type, dict) {
    var e = document.createEvent("Event");
    dict = dict || {};
    dict.bubbles = dict.bubbles || false;
    dict.catchable = dict.catchable || false;
    e.initEvent(type, dict.bubbles, dict.catchable);
    return e;
};
