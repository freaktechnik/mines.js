//TODO some way to ensure there's only one game at a time.
var globalState = {},
    swPostMessage,
    resolveWith = null;

if('serviceWorker' in navigator) {
    swPostMessage = function(cmd, msg) {
        if(navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.swPostMessage({
                command: cmd,
                message: msg
            });
            return true;
        }
        return false;
    };

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
        if(!swPostMessage('global-event', eventName)) {
            var e = new Event(eventName);
            document.dispatchEvent(e);
        }
    };
    globalState.setGameState = function(state) {
        swPostMessage('game-state-change', state);
        this.dispatchEvent('gamestate');
    };
    globalState.getGameState = function() {
        return new Promise(function(resolve) {
            resolveWith = resolve;
            if(!swPostMessage('game-state')) {
                resolveWith = null;
                resolve(false);
            }
        });
    };
}
else {
    globalState.dispatchEvent = function(eventName) {
        var e = new Event(eventName);
        document.dispatchEvent(e);
    };
    globalState.setGameState = function(state) {
        return state;
    };
    globalState.getGameState = function() {
        return Promise.resolve(false);
    };
}

export default globalState;
