/**
 * (Static) Highscores thing
 */

var Highscores = {
    VERSION: 2,
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

        request.onerror = function() {
            console.error(request.error);
        };
    },
    setupDB: function(e) {
        this.db = e.target.result;

        var self = this,
            oldData = [],
            cont = function() {
                var scores = self.db.createObjectStore(self.TABLE, { keyPath: [ "score", "game" ] });
                scores.createIndex("game", "game", { unique: false });

                if(oldData.length) {
                    oldData.forEach(function(score) {
                        scores.add(score);
                    });
                }

                self.setReady();
            },
            store,
            request;

        if(e.oldVersion > 0) {
            store = e.target.transaction.objectStore(this.TABLE);
            request = store.openCursor();

            request.onsuccess = function(e) {
                var cursor = e.target.result;
                if(cursor) {
                    oldData.push(cursor.value);
                    cursor.continue();
                }
                else {
                    self.db.deleteObjectStore(self.TABLE);
                    cont();
                }
            };
            //TODO next upgrade: convert all the scores to floats.
        }
        else {
            cont();
        }
    },
    setReady: function() {
        this.ready = true;
        document.dispatchEvent(new Event("dbready"));
    },
    clear: function() {
        var transaction = this.db.transaction(this.TABLE, "readwrite"),
            store = transaction.objectStore(this.TABLE);
        store.clear();
    },
    isNewTop: function(gameDescription, score, cbk) {
        this.getTop(gameDescription, 1, function(top) {
            cbk(!top.length || score < top[0].score);
        });
    },
    save: function(gameDescription, score, name) {
        var transaction = this.db.transaction(this.TABLE, "readwrite"),
            store = transaction.objectStore(this.TABLE),
            object = { game: gameDescription, score: score, name: name };
        store.add(object);
    },
    getTop: function(gameDescription, num, cbk) {
        var transaction = this.db.transaction(this.TABLE, "readonly"),
            store = transaction.objectStore(this.TABLE),
            request = store.index("game").openCursor(gameDescription),
            top = [];

        request.onsuccess = function(e) {
            var cursor = e.target.result,
                entry;

            if(cursor) {
                entry = cursor.value;
                entry.score = parseFloat(entry.score);
                top.push(entry);
                cursor.continue();
            }
            else if(cbk) {
                cbk(top.sort(function(a, b) {
                    return a.score - b.score;
                }).slice(0, num));
            }
        };
    },
    getGames: function(cbk) {
        var transaction = this.db.transaction(this.TABLE, "readonly"),
            store = transaction.objectStore(this.TABLE),
            request = store.index("game").openKeyCursor(),
            games = [];

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

export default Highscores;
