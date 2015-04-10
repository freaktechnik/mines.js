window.Event = function Event(type, dict) {
    var e = document.createEvent("Event");
    dict = dict || {};
    dict.bubbles = dict.bubbles || false;
    dict.catchable = dict.catchable || false;
    e.initEvent(type, dict.bubbles, dict.catchable);
    return e;
};

// Free interpretation of the MDN polyfill
window.CustomEvent = function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    params.bubbles = params.bubbles || false;
    params.cancelable = params.cancelable || false;
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
};
