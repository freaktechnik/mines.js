import Hammer from 'hammerjs';
import Mines from '../../src/mines';
import Preferences from '../../src/settings';
import Timer from '../../src/timer';
import Highscores from '../../src/highscores';
import globalState from './register-service-worker';

function gameDescriptionFromMines(mines) {
    return mines.dimensions[0] + "x" + mines.dimensions[1] + ":" + mines.mineCount;
}

const Page = {
    init() {
        this.mines = this.getMinesFromHash(document.location.hash.substr(1));
        this.mines.setSize(Preferences.fieldsize.value);
        this.mines.autoUncover = Preferences.autouncover.value;

        this.Toolbar.init(this.mines);

        const hammer = new Hammer.Manager(this.field),
            pinch = new Hammer.Pinch({ threshold: 0 }),
            HIGHSCORE_USER = "highscoreUser";

        let initialSize = Preferences.fieldsize.value;

        this.field.addEventListener("generated", () => {
            globalState.setGameState(true);
            if(Preferences.autotoggle.value) {
                this.mines.toggleMode();
            }
        }, false);

        this.field.addEventListener("loose", () => {
            globalState.setGameState(false);
            this.vibrate(500);
        }, false);

        this.field.addEventListener("win", () => {
            const game = gameDescriptionFromMines(this.mines),
                time = this.Toolbar.timer.model.getTime() / 1000.0;
            globalState.setGameState(false);

            Highscores.isNewTop(game, time, (newTop) => {
                if(newTop) {
                    const lastUser = localStorage.getItem(HIGHSCORE_USER),
                        input = document.getElementById("highscore-user");
                    if(lastUser) {
                        input.value = lastUser;
                        document.getElementById("highscore-user-label").classList.add("active");
                    }

                    input.focus();

                    $('#highscore-alert').openModal();
                }
            });
        }, false);

        document.getElementById("highscore-form").addEventListener("submit", () => {
            const user = document.getElementById("highscore-user").value,
                game = gameDescriptionFromMines(this.mines),
                time = this.Toolbar.timer.model.getTime() / 1000.0;

            $('#highscore-alert').closeModal();

            if(user.length) {
                localStorage.setItem(HIGHSCORE_USER, user);
                Highscores.save(game, time, user);
            }
            // else toast not saved
        }, false);

        this.field.addEventListener("flagged", () => {
            if(!this.Toolbar.flagtoggle.button.checked) {
                this.vibrate(50);
            }
        }, false);

        this.field.addEventListener("unflagged", () => {
            if(!this.Toolbar.flagtoggle.button.checked) {
                this.vibrate(50);
            }
        }, false);

        this.field.addEventListener("help", () => {
            window.location = document.querySelector('link[rel="help"]').href;
        });

        document.addEventListener("visibilitychange", () => {
            if(document.visibilityState === "hidden" && !this.mines.done && this.mines.boardGenerated) {
                globalState.setGameState(false);
                this.mines.saveState();
                this.Toolbar.unload();
                //TODO only soft unload? Don't destroy anything?
            }
            else if(document.visibilityState === "visible" && this.mines.boardGenerated && this.mines.paused) {
                //TODO resume game...
            }
        }, false);

        window.addEventListener("hashchange", () => {
            window.location.reload();
            //TODO should not have to reload here.
        }, false);

        // Scaling on mobile (since desktop browsers don't let us override it anyways, so nobody complain, k?)
        // enable all touch actions so we still get scrolling and the click events
        hammer.set({ touchAction: "auto" });
        hammer.add(pinch);

        hammer.on("pinchstart", () => {
            initialSize = this.mines.size;
        });

        hammer.on("pinch", (e) => {
            this.mines.setSize(initialSize * e.scale);
        });
    },
    get field() {
        return document.getElementById("field");
    },
    mines: null,
    Toolbar: {
        init(mines) {
            this.output.value = mines.mineCount - mines.countFlags();

            this.timer.init(mines);
            this.flagtoggle.init(mines);

            this.reset.addEventListener("click", () => {
                mines.reset();
            }, false);

            mines.context.addEventListener("reset", () => {
                this.output.value = mines.mineCount;
            });

            mines.context.addEventListener("flagged", () => {
                this.output.value = parseInt(this.output.value, 10) - 1;
            }, false);

            mines.context.addEventListener("unflagged", () => {
                this.output.value = parseInt(this.output.value, 10) + 1;
            }, false);
        },
        unload() {
            this.timer.unload();
        },
        get output() {
            return document.getElementById("minecount");
        },
        get reset() {
            return document.getElementById("reset");
        },
        flagtoggle: {
            init(mines) {
                mines.context.addEventListener("modetoggle", () => {
                    this.toggle();
                }, false);

                mines.context.addEventListener("reset", () => {
                    if(this.button.checked) {
                        this.toggle();
                    }
                }, false);

                this.button.addEventListener("change", () => {
                    // Dirty workaround e.preventDefault() not working. This
                    // toggles the checkbox back to its initial state, so the
                    // modetoggle event listener can toggle it.
                    this.toggle();
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
            init(mines) {
                let time = 0;
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
            deleteSave() {
                localStorage.setItem(this.SAVED_TIME, this.NOT_HAS_SAVED_TIME);
                localStorage.setItem(this.TIME, "0");
            },
            unload() {
                localStorage.setItem(this.TIME, this.model.stop());
                localStorage.setItem(this.SAVED_TIME, this.HAS_SAVED_TIME);
            }
        }
    },
    // Execute an asynchonous vibration if it's enabled
    vibrate: function PageVibrate(time) {
        if("vibrate" in navigator && Preferences.vibration.value) {
            setTimeout(() => {
                navigator.vibrate(time);
            }, 0);
        }
    },
    deleteSave: function PageDeleteSave() {
        Mines.removeSavedState();

        this.Toolbar.timer.deleteSave();
    },
    getMinesFromHash: function PageGetMinesFromHash(hash) {
        if(hash.charAt(0) == "r" || (!hash && Mines.hasSavedState())) {
            const mines = Mines.restoreSavedState(this.field);
            if(!mines) {
                $('#save-corrupt').openModal({
                    complete() {
                        Mines.removeSavedState();
                        window.location = "index.html";
                    }
                });
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
            let preset;
            if(hash.charAt(0) == "c") {
                document.querySelector("#nav-mobile li[data-difficulty='custom']").classList.add("active");
                const vals = hash.match(/^c([0-9]+)x([0-9]+):([0-9]+)/);
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
