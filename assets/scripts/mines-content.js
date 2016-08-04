import Hammer from 'hammerjs';
import Mines from '../../src/mines';
import Preferences from '../../src/settings';
import StringBundle from '../../src/stringbundle';
import Timer from '../../src/timer';
import Highscores from '../../src/highscores';
import globalState from './register-service-worker';

function gameDescriptionFromMines(mines) {
    return mines.dimensions[0]+"x"+mines.dimensions[1]+":"+mines.mineCount;
}

var Page = {
    init: function PageInit() {
        this.strbundle = new StringBundle(document.getElementById("strings"));

        this.mines = this.getMinesFromHash(document.location.hash.substr(1));
        this.mines.setSize(Preferences.fieldsize.value);
        this.mines.autoUncover = Preferences.autouncover.value;

        this.Toolbar.init(this.mines);

        var self = this,
            hammer = new Hammer.Manager(this.field),
            pinch = new Hammer.Pinch({ threshold: 0 }),
            initialSize = Preferences.fieldsize.value;

        this.field.addEventListener("generated", function() {
            globalState.setGameState(true);
            if(Preferences.autotoggle.value) {
                self.mines.toggleMode();
            }
        }, false);

        this.field.addEventListener("loose", function() {
            globalState.setGameState(false);
            self.vibrate(500);
        }, false);

        this.field.addEventListener("win", function() {
            globalState.setGameState(false);
            var game = gameDescriptionFromMines(self.mines),
                time = self.Toolbar.timer.model.getTime()/1000.0,
                HIGHSCORE_USER = "highscoreUser";

            Highscores.isNewTop(game, time, function(newTop) {
                if(newTop) {
                    var lastUser = localStorage.getItem(HIGHSCORE_USER) || "",
                        user = window.prompt(self.strbundle.getString('mines_new_highscore'), lastUser);

                    if(user) {
                        localStorage.setItem(HIGHSCORE_USER, user);
                        Highscores.save(game, time, user);
                    }
                }
            });
        }, false);

        this.field.addEventListener("flagged", function() {
            if(self.Toolbar.flagtoggle.mode == self.Toolbar.flagtoggle.UNCOVER) {
                self.vibrate(50);
            }
        }, false);

        this.field.addEventListener("unflagged", function() {
            if(self.Toolbar.flagtoggle.mode == self.Toolbar.flagtoggle.UNCOVER) {
                self.vibrate(50);
            }
        }, false);

        this.field.addEventListener("help", function() {
            window.location = document.querySelector('link[rel="help"]').href;
        });

        window.addEventListener("beforeunload", function() {
            if(!self.mines.done && self.mines.boardGenerated) {
                globalState.setGameState(false);
                self.mines.saveState();
                self.Toolbar.unload();
            }
        }, false);

        window.addEventListener("hashchange", function() {
            window.location.reload();
        }, false);

        // Scaling on mobile (since desktop browsers don't let us override it anyways, so nobody complain, k?)
        // enable all touch actions so we still get scrolling and the click events
        hammer.set({ touchAction: "auto" });
        hammer.add(pinch);

        hammer.on("pinchstart", function() {
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
    strbundle: null,
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
        unload: function() {
            this.timer.unload();
        },
        get output() {
            return document.getElementById("minecount");
        },
        get reset() {
            return document.getElementById("reset");
        },
        flagtoggle: {
            init: function(mines) {
                var self = this;

                mines.context.addEventListener("modetoggle", function() {
                    self.toggle();
                }, false);

                mines.context.addEventListener("reset", function() {
                    if(self.button.checked) {
                        self.toggle();
                    }
                }, false);

                this.button.addEventListener("change", function() {
                    // Dirty workaround e.preventDefault() not working. This
                    // toggles the checkbox back to its initial state, so the
                    // modetoggle event listener can toggle it.
                    self.toggle();
                    mines.toggleMode();
                }, false);
            },
            get button() {
                return document.getElementById("flagtoggle");
            },
            toggle() {
                this.button.checked = !this.button.checked;
            }
        },
        timer: {
            SAVED_TIME: "savedTime",
            TIME: "time",
            HAS_SAVED_TIME: "true",
            NOT_HAS_SAVED_TIME: "false",
            init: function(mines) {
                var time = 0;
                const buttonIcon = document.getElementById("pauseicon"),
                    gameOver = () => {
                        this.model.pause();
                        buttonIcon.textContent = "loop";
                    };

                if(localStorage.getItem(this.SAVED_TIME) == this.HAS_SAVED_TIME) {
                    time = parseInt(localStorage.getItem(this.TIME), 10);
                    localStorage.setItem(this.SAVED_TIME, this.NOT_HAS_SAVED_TIME);
                    localStorage.setItem(this.TIME, "0");
                }

                this.model = new Timer(time, this.output);
                if(time !== 0 && !mines.paused) {
                    this.model.start();
                }
                else {
                    buttonIcon.textContent = "play_arrow";
                }

                mines.context.addEventListener("generated", this.model.start.bind(this.model), false);
                mines.context.addEventListener("loose", gameOver, false);
                mines.context.addEventListener("win", gameOver, false);
                mines.context.addEventListener("reset", this.model.reset.bind(this.model), false);
                mines.context.addEventListener("pause", this.model.pause.bind(this.model), false);
                mines.context.addEventListener("unpause", this.model.start.bind(this.model), false);

                this.output.addEventListener("start", () => {
                    buttonIcon.textContent = "pause";
                }, false);
                this.output.addEventListener("pause", () => {
                    if(!mines.done) {
                        buttonIcon.textContent = "play_arrow";
                    }
                }, false);

                this.button.addEventListener("click", () => {
                    if(mines.boardGenerated && !mines.done) {
                        mines.togglePause();
                    }
                    else if(mines.done) {
                        mines.reset();
                    }
                }, false);
            },
            model: null,
            get button() {
                return document.getElementById("pause");
            },
            get output() {
                return document.getElementById("time");
            },
            deleteSave: function() {
                localStorage.setItem(this.SAVED_TIME, this.NOT_HAS_SAVED_TIME);
                localStorage.setItem(this.TIME, "0");
            },
            unload: function() {
                localStorage.setItem(this.TIME, this.model.stop());
                localStorage.setItem(this.SAVED_TIME, this.HAS_SAVED_TIME);
            }
        }
    },
    // Execute an asynchonous vibration if it's enabled
    vibrate: function PageVibrate(time) {
        if("vibrate" in navigator && Preferences.vibration.value) {
            setTimeout(function() {
                navigator.vibrate(time);
            }, 0);
        }
    },
    deleteSave: function PageDeleteSave() {
        Mines.removeSavedState();

        this.Toolbar.timer.deleteSave();
    },
    getMinesFromHash: function PageGetMinesFromHash(hash) {
        var mines,
            preset,
            vals;
        if(hash.charAt(0) == "r" || (!hash && Mines.hasSavedState())) {
            mines = Mines.restoreSavedState(this.field);
            if(!mines) {
                window.alert(this.strbundle.getString('mines_restore_error'));
                Mines.removeSavedState();
                window.location = "index.html";
            }
            else {
                const menuItem = document.getElementById("continuemenu");
                menuItem.hidden = false;
                menuItem.classList.add("active");
                if(mines.mode == Mines.MODE_FLAG) {
                    this.Toolbar.flagtoggle.toggle();
                }
                mines.pause();
                return mines;
            }
        }
        else {
            this.deleteSave();
            if(hash.charAt(0) == "c") {
                document.querySelector("#nav-mobile li[data-difficulty='custom']").classList.add("active");
                vals = hash.match(/^c([0-9]+)x([0-9]+):([0-9]+)/);
                preset = { size: [ parseInt(vals[1], 10), parseInt(vals[2], 10) ], mines: parseInt(vals[3], 10) };
            }
            else {
                const difficulty = hash || "beginner";
                document.querySelector(`#nav-mobile li[data-difficulty='${difficulty}']`).classList.add("active");
                preset = Mines.defaultBoards[difficulty];
            }
            return new Mines(this.field, preset.size, preset.mines);
        }
    }
};

Page.init();

