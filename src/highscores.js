/**
 * (Static) Highscores thing
 */

var Highscores = {
    VERSION: 1,
    TABLE: "scores",
    db: null,
    ready: false,
    init: function() {
        var request = window.indexedDB.open("highscores", this.VERSION);

        // Create DB if needed
        request.onupgradeneeded = this.setupDB.bind(this);
        // DB already set up
        request.onsuccess = (function(e) {
            this.db = e.target.result;
            this.setReady();
        }).bind(this);

        request.onerror = console.error.bind(console);
    },
    setupDB: function(e) {
        this.db = e.target.result;

        var scores = this.db.createObjectStore(this.TABLE, { keyPath: "score" });
        scores.createIndex("game", "game", { unique: false });

        this.setReady();
    },
    setReady: function() {
        this.ready = true;
        document.dispatchEvent(new Event("dbready"));
    },
    clear: function() {
        var transaction = this.db.transaction(this.TABLE, "readwrite");
        var store = transaction.objectStore(this.TABLE);
        store.clear();
    },
    isNewTop: function(gameDescription, score, cbk) {
        this.getTop(gameDescription, 1, function(top) {
            cbk(!top.length || score < top[0].score);
        });
    },
    save: function(gameDescription, score, name) {
        var transaction = this.db.transaction(this.TABLE, "readwrite");
        var store = transaction.objectStore(this.TABLE);
        var object = { game: gameDescription, score: score, name: name };
        var request = store.add(object);
    },
    getTop: function(gameDescription, num, cbk) {
        var transaction = this.db.transaction(this.TABLE, "readonly");
        var store = transaction.objectStore(this.TABLE);
        var request = store.index("game").openCursor(gameDescription);

        var top = [];
        request.onsuccess = function(e) {
            var cursor = e.target.result;

            if(cursor && top.length < num) {
                top.push(cursor.value);
                cursor.continue();
            }
            else if(cbk) {
                cbk(top);
            }
        };
    },
    getGames: function(cbk) {
        var transaction = this.db.transaction(this.TABLE, "readonly");
        var store = transaction.objectStore(this.TABLE);
        var request = store.index("game").openKeyCursor();

        var games = [];
        request.onsuccess = function(e) {
            var cursor = e.target.result;

            if(cursor) {
                if(games.indexOf(cursor.key) == -1) {
                    games.push(cursor.key);
                }
                cursor.continue();
            }
            else if(cbk) {
                cbk(games);
            }
        };
    }
};
Highscores.init();
