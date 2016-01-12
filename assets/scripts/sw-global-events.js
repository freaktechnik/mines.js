var gameState = false;

self.addEventListener("message", function(event) {
    if(event.data.command == 'global-event') {
        var promise = self.clientList.matchAll().then(function(clients) {
            client.postMessage(event.data);
        });

        // For chrome compatibility
        if(event.waitUntil)
            event.waitUntil(promise);
    }
    else if(event.data.command == 'game-state-change') {
        gameState = event.data.message;
    }
    else if(event.data.command == 'game-state') {
        event.ports[0].postMessage({
            command: 'game-state',
            message: gameState
        });
    }
});
