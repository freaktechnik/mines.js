//TODO some way to ensure there's only one game at a time.
var globalState = {};

if('serviceWorker' in navigator) {
    var postMessage = function(cmd, msg) {
        if(navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                command: cmd,
                message: msg
            });
            return true;
        }
        return false;
    };
    // ugly way to do promises, but meh.
    var resolveWith = null;

    navigator.serviceWorker.register('service-worker.js');

    navigator.serviceWorker.addEventListener("message", function(event) {
        if(event.data.command == 'global-event') {
            var e = new Event(event.data.message);
            document.dispatchEvent(e);
        }
        else if(event.data.command == 'game-state') {
            if(resolveWith !== null) {
                resolveWith(event.data.message);
                resolveWith = null;
            }
        }
    });
    globalState.dispatchEvent = function(eventName) {
        if(!postMessage('global-event', eventName)) {
            var e = new Event(eventName);
            document.dispatchEvent(e);
        }
    };
    globalState.setGameState = function(state) {
        postMessage('game-state-change', state);
        this.dispatchEvent('gamestate');
    };
    globalState.getGameState = function() {
        return new Promise(function(resolve, reject) {
            resolveWith = resolve;
            if(!postMessage('game-state')) {
                resolveWith = null;
                resolve(false);
            }
        });
    };
}
else {
    globalState.dispatchEvent = function(eventName) {
        var e = new Event(eventName);
        document.dispatchEvent(eventName);
    };
    globalState.setGameState = function(state) {};
    globalState.getGameState = function() { return Promise.resolve(false); };
}
