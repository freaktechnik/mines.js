function gameDescriptionFromMines(mines) {
    return mines.dimensions[0]+"x"+mines.dimensions[1]+":"+mines.mineCount;
}

var Page = {
    init: function Page_init() {
        this.mines = this.getMinesFromHash(document.location.hash.substr(1));
        this.mines.setSize(Preferences.fieldsize.value);

        this.Toolbar.init(this.mines);

        var self = this;
        this.field.addEventListener("generated", function() {
            if(Preferences.autotoggle.value) {
                self.mines.toggleMode();
            }
        }, false);

        this.field.addEventListener("loose", function() {
            self.vibrate(500);
        }, false);

        this.field.addEventListener("win", function() {
            var game = gameDescriptionFromMines(self.mines);
            var time = self.Toolbar.timer.model.getTime()/1000.0;
            var HIGHSCORE_USER = "highscoreUser";

            Highscores.isNewTop(game, time, function(newTop) {
                if(newTop) {
                    var lastUser = localStorage.getItem(HIGHSCORE_USER);
                    if(lastUser === null)
                        lastUser = "";
                    var user = window.prompt(document.querySelector("[data-l10n-id='mines_new_highscore']").textContent, lastUser);
                    if(user) {
                        localStorage.setItem(HIGHSCORE_USER, user);
                        Highscores.save(game, time.toFixed(2), user);
                    }
                }
            });
        }, false);

        this.field.addEventListener("flagged", function() {
            if(self.Toolbar.flagtoggle.mode == self.Toolbar.flagtoggle.UNCOVER) {
                self.vibrate(20);
            }
        }, false);

        this.field.addEventListener("unflagged", function() {
            if(self.Toolbar.flagtoggle.mode == self.Toolbar.flagtoggle.UNCOVER) {
                self.vibrate(20);
            }
        }, false);

        window.addEventListener("beforeunload", function() {
            if(!self.mines.done && self.mines.boardGenerated) {
                self.mines.saveState();
            }
        }, false);

        document.getElementById("header").addEventListener("action", function() {
            window.location = "index.html";
        }, false);

        // Scaling on mobile (since desktop browsers don't let us override it anyways, so nobody complain, k?)

        var hammer = new Hammer.Manager(this.field);
        // enable all touch actions so we still get scrolling and the click events
        hammer.set({ touchAction: "auto" });

        var pinch = new Hammer.Pinch({ threshold: 0 });

        hammer.add(pinch);

        var initialSize = Preferences.fieldsize.value;

        hammer.on("pinchstart", function(e) {
            initialSize = self.mines.size;
        });

        hammer.on("pinch", function(e) {
            self.mines.setSize(initialSize * e.scale);
        });
    },
    get field() {
        return document.getElementById("field");
    },
    mines: null,
    Toolbar: {
        init: function(mines) {
            this.output.value = mines.mineCount - mines.countFlags();

            this.timer.init(mines);
            this.flagtoggle.init(mines);

            this.reset.addEventListener("click", function() {
                mines.reset();
            }, false);

            var self = this;
            mines.context.addEventListener("reset", function() {
                self.output.value = mines.mineCount;
            });

            mines.context.addEventListener("flagged", function() {
                self.output.value = parseInt(self.output.value, 10) - 1;
            }, false);

            mines.context.addEventListener("unflagged", function() {
                self.output.value = parseInt(self.output.value, 10) + 1;
            }, false);
        },
        get output() {
            return document.getElementById("minecount");
        },
        get reset() {
            return document.getElementById("reset");
        },
        flagtoggle: {
            UNCOVER: "mines_mode_uncover",
            FLAG: "mines_mode_flag",
            UNCOVER_ICON: "brightness",
            FLAG_ICON: "flag",
            init: function(mines) {
                var self = this;
                mines.context.addEventListener("modetoggle", function() {
                    self.toggle();
                }, false);

                mines.context.addEventListener("reset", function() {
                    var flagtoggle = self.button;
                    navigator.mozL10n.setAttributes(flagtoggle, self.UNCOVER);
                    flagtoggle.dataset.icon = self.UNCOVER_ICON;
                }, false);

                this.button.addEventListener("click", function(e) {
                    mines.toggleMode();
                }, false);
            },
            get button() {
                return document.getElementById("flagtoggle");
            },
            get mode() {
                return navigator.mozL10n.getAttributes(this.button).id;
            },
            toggle: function Toolbar_toggleMode() {
                var button = this.button;

                if(this.mode == this.UNCOVER) {
                    navigator.mozL10n.setAttributes(button, this.FLAG);
                    button.dataset.icon = this.FLAG_ICON;
                }
                else {
                    navigator.mozL10n.setAttributes(button, this.UNCOVER);
                    button.dataset.icon = this.UNCOVER_ICON;
                }
            }
        },
        timer: {
            SAVED_TIME: "savedTime",
            TIME: "time",
            HAS_SAVED_TIME: "true",
            NOT_HAS_SAVED_TIME: "false",
            init: function(mines) {
                var time = 0;
                if(localStorage.getItem(this.SAVED_TIME) == this.HAS_SAVED_TIME) {
                    time = parseInt(localStorage.getItem(this.TIME), 10);
                    localStorage.setItem(this.SAVED_TIME, this.NOT_HAS_SAVED_TIME);
                    localStorage.setItem(this.TIME, "0");
                }

                this.model = new Timer(time, this.output);
                if(time !== 0) {
                    this.model.start();
                }

                mines.context.addEventListener("generated", this.model.start.bind(this.model), false);
                mines.context.addEventListener("loose", this.model.pause.bind(this.model), false);
                mines.context.addEventListener("win", this.model.pause.bind(this.model), false);
                mines.context.addEventListener("reset", this.model.reset.bind(this.model), false);

                var self = this;
                window.addEventListener("beforeunload", function() {
                    if(!mines.done && mines.boardGenerated) {
                        localStorage.setItem(self.TIME, self.model.stop());
                        localStorage.setItem(self.SAVED_TIME, self.HAS_SAVED_TIME);
                    }
                }, false);
            },
            model: null,
            get output() {
                return document.getElementById("time");
            },
            deleteSave: function() {
                localStorage.setItem(this.SAVED_TIME, this.NOT_HAS_SAVED_TIME);
                localStorage.setItem(this.TIME, "0");
            }
        }
    },
    // Execute an asynchonous vibration if it's enabled
    vibrate: function Page_vibrate(time) {
        if("vibrate" in navigator && Preferences.vibration.value)
            setTimeout(function() { navigator.vibrate(time); }, 0);
    },
    deleteSave: function Page_deleteSave() {
        Mines.removeSavedState();

        this.Toolbar.timer.deleteSave();
    },
    getMinesFromHash: function Page_getMinesFromHash(hash) {
        if(hash.charAt(0) == "r") {
            var mines = Mines.restoreSavedState(this.field);
            if(!mines) {
                window.alert(document.querySelector("[data-l10n-id='mines_restore_error']").textContent);
                Mines.removeSavedState();
                window.location = "index.html";
            }
            else {
                if(mines.mode == Mines.MODE_FLAG) {
                    this.Toolbar.flagtoggletoggle();
                }
                return mines;
            }
        }
        else {
            this.deleteSave();
            var preset;
            if(hash.charAt(0) == "c") {
                var vals = hash.match(/^c([0-9]+)x([0-9]+):([0-9]+)/);
                preset = { size: [parseInt(vals[1], 10), parseInt(vals[2], 10)], mines: parseInt(vals[3], 10) };
            }
            else {
                preset = Mines.defaultBoards[hash];
            }
            return new Mines(this.field, preset.size, preset.mines);
        }
    }
};

Page.init();

