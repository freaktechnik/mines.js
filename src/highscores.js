/**
 * (Static) Highscores thing
 */

const Highscores = {
    VERSION: 2,
    TABLE: "scores",
    db: null,
    ready: false,
    init() {
        const request = window.indexedDB.open("highscores", this.VERSION);

        // Create DB if needed
        request.onupgradeneeded = this.setupDB.bind(this);
        // DB already set up
        request.onsuccess = (e) => {
            this.db = e.target.result;
            this.setReady();
        };

        request.onerror = () => {
            console.error(request.error);
        };
    },
    setupDB(e) {
        this.db = e.target.result;

        const oldData = [],
            cont = () => {
                const scores = this.db.createObjectStore(self.TABLE, { keyPath: [ "score", "game" ] });
                scores.createIndex("game", "game", { unique: false });

                if(oldData.length) {
                    oldData.forEach((score) => {
                        scores.add(score);
                    });
                }

                this.setReady();
            };

        if(e.oldVersion > 0) {
            const store = e.target.transaction.objectStore(this.TABLE),
                request = store.openCursor();

            request.onsuccess = (e) => {
                const cursor = e.target.result;
                if(cursor) {
                    oldData.push(cursor.value);
                    cursor.continue();
                }
                else {
                    this.db.deleteObjectStore(self.TABLE);
                    cont();
                }
            };
            //TODO next upgrade: convert all the scores to floats.
        }
        else {
            cont();
        }
    },
    setReady() {
        this.ready = true;
        document.dispatchEvent(new Event("dbready"));
    },
    clear() {
        const transaction = this.db.transaction(this.TABLE, "readwrite"),
            store = transaction.objectStore(this.TABLE);
        store.clear();
    },
    isNewTop(gameDescription, score, cbk) {
        this.getTop(gameDescription, 1, (top) => {
            cbk(!top.length || score < top[0].score);
        });
    },
    save(gameDescription, score, name) {
        const transaction = this.db.transaction(this.TABLE, "readwrite"),
            store = transaction.objectStore(this.TABLE),
            object = { game: gameDescription, score, name };
        store.add(object);
    },
    getTop(gameDescription, num, cbk) {
        const transaction = this.db.transaction(this.TABLE, "readonly"),
            store = transaction.objectStore(this.TABLE),
            request = store.index("game").openCursor(gameDescription),
            top = [];

        request.onsuccess = (e) => {
            const cursor = e.target.result;

            if(cursor) {
                const entry = cursor.value;
                entry.score = parseFloat(entry.score);
                top.push(entry);
                cursor.continue();
            }
            else if(cbk) {
                cbk(top.sort((a, b) => {
                    return a.score - b.score;
                }).slice(0, num));
            }
        };
    },
    getGames(cbk) {
        const transaction = this.db.transaction(this.TABLE, "readonly"),
            store = transaction.objectStore(this.TABLE),
            request = store.index("game").openKeyCursor(),
            games = [];

        request.onsuccess = (e) => {
            const cursor = e.target.result;

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
