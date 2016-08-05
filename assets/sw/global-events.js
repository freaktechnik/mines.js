let gameState = false;

self.addEventListener("message", (event) => {
    if(event.data.command == 'global-event') {
        const promise = self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
                client.postMessage(event.data);
            });
        });

        // For chrome compatibility
        if(event.waitUntil) {
            event.waitUntil(promise);
        }
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
