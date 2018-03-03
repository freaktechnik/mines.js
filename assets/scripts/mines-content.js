import Hammer from 'hammerjs';
import Mines from '../../src/mines';
import Preferences from '../../src/settings';
import Timer from '../../src/timer';
import Highscores from '../../src/highscores';
import globalState from './register-service-worker';
import $ from 'jquery';

const DIM_X = 0,
    DIM_Y = 1,
    HASH = "#",
    VIBRATE_LONG = 500,
    VIBRATE_SHORT = 50,
    MS_TO_S = 1000.0,
    TIME_STOPPED = 0;

function gameDescriptionFromMines(mines) {
    return `${mines.dimensions[DIM_X]}x${mines.dimensions[DIM_Y]}:${mines.mineCount}`;
}

const Page = {
    init() {
        this.mines = this.getMinesFromHash(document.location.hash.substr(HASH.length));
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
            this.vibrate(VIBRATE_LONG);
        }, false);

        this.field.addEventListener("win", () => {
            const game = gameDescriptionFromMines(this.mines),
                time = this.Toolbar.timer.model.getTime() / MS_TO_S;
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
                time = this.Toolbar.timer.model.getTime() / MS_TO_S;

            $('#highscore-alert').closeModal();

            if(user.length) {
                localStorage.setItem(HIGHSCORE_USER, user);
                Highscores.save(game, time, user);
            }
            // else toast not saved
        }, false);

        this.field.addEventListener("flagged", () => {
            if(!this.Toolbar.flagtoggle.button.checked) {
                this.vibrate(VIBRATE_SHORT);
            }
        }, false);

        this.field.addEventListener("unflagged", () => {
            if(!this.Toolbar.flagtoggle.button.checked) {
                this.vibrate(VIBRATE_SHORT);
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
                this.output.valueAsNumber -= 1;
            }, false);

            mines.context.addEventListener("unflagged", () => {
                this.output.valueAsNumber += 1;
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
                if(time !== TIME_STOPPED && !mines.paused) {
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
    vibrate(time) {
        if("vibrate" in navigator && Preferences.vibration.value) {
            const IMMEDIATE = 0;
            setTimeout(() => {
                navigator.vibrate(time);
            }, IMMEDIATE);
        }
    },
    deleteSave() {
        Mines.removeSavedState();

        this.Toolbar.timer.deleteSave();
    },
    getMinesFromHash(hash) {
        if(hash.startsWith("r") || (!hash && Mines.hasSavedState())) {
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
            if(hash.startsWith("c")) {
                document.querySelector("#nav-mobile li[data-difficulty='custom']").classList.add("active");
                const [
                    match, // eslint-disable-line no-unused-vars
                    width,
                    height,
                    count
                ] = hash.match(/^c(\d+)x(\d+):(\d+)/) || [];
                preset = {
                    size: [
                        parseInt(width, 10),
                        parseInt(height, 10)
                    ],
                    mines: parseInt(count, 10)
                };
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
