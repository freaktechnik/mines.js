import runtime from 'offline-plugin/runtime';

//TODO some way to ensure there's only one game at a time.
const globalState = {};

if('serviceWorker' in navigator) {
    const swPostMessage = function(cmd, msg) {
        if(navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                command: cmd,
                message: msg
            });
            return true;
        }
        return false;
    };

    let resolveWith = null;

    runtime.install({
        onUpdateReady: () => {
            runtime.applyUpdate();
        }
    });

    navigator.serviceWorker.addEventListener("message", (event) => {
        if(event.data.command == 'global-event') {
            const e = new Event(event.data.message);
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
            const e = new Event(eventName);
            document.dispatchEvent(e);
        }
    };
    globalState.setGameState = function(state) {
        swPostMessage('game-state-change', state);
        this.dispatchEvent('gamestate');
    };
    globalState.getGameState = function() {
        return new Promise((resolve) => {
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
        const e = new Event(eventName);
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
