/**
 * Timer thing
 */

const TIME_UNIT_STRING = "mines_time_unit";

function Timer(offset = 0, output) {
    this.offset = offset;
    this.output = output;

    if("Intl" in window) {
        this._nf = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
    }
    const time = this.formatTime(this.offset);

    navigator.mozL10n.setAttributes(this.output, TIME_UNIT_STRING, { time });
    navigator.mozL10n.translateFragment(this.output);
}

Timer.prototype.output = null;
Timer.prototype.startTime = 0;
Timer.prototype.offset = 0;
Timer.prototype.interval = 0;
Timer.prototype.running = false;

Timer.prototype.formatTime = function(time) {
    if(this._nf) {
        return this._nf.format(time / 1000.0);
    }
    else {
        return (time / 1000.0).toFixed(1);
    }
};

Timer.prototype.updateOutput = function(time) {
    if(typeof time !== "number") {
        time = Date.now() - this.startTime;
    }

    const timeStr = this.formatTime(time);

    navigator.mozL10n.setAttributes(this.output, TIME_UNIT_STRING, { time: timeStr });
    navigator.mozL10n.translateFragment(this.output);
};

Timer.prototype.reset = function() {
    this.startTime = 0;
    this.offset = 0;
    this.updateOutput(0.0);
    this.running = false;
    if(this.interval) {
        clearInterval(this.interval);
        this.interval = 0;
    }
    this.output.dispatchEvent(new Event("reset"));
};

Timer.prototype.getTime = function() {
    if(!this.running) {
        return this.offset;
    }
    else {
        return Date.now() - this.startTime;
    }
};

Timer.prototype.start = function() {
    if(!this.running) {
        this.startTime = Date.now() - this.offset;
        this.running = true;
        if(this.output) {
            this.interval = setInterval(this.updateOutput.bind(this), 100);
            this.output.dispatchEvent(new Event("start"));
        }
    }
};

Timer.prototype.pause = function() {
    if(this.running) {
        this.offset = Date.now() - this.startTime;
        this.running = false;
        if(this.interval) {
            clearInterval(this.interval);
            this.interval = 0;
            this.updateOutput(this.offset);
            this.output.dispatchEvent(new CustomEvent("pause", { detail: this.offset }));
        }
    }
};

Timer.prototype.stop = function() {
    if(this.running) {
        const time = Date.now() - this.startTime;
        this.running = false;
        if(this.interval) {
            clearInterval(this.interval);
            this.interval = 0;
            this.output.dispatchEvent(new CustomEvent("stop", { detail: time }));
        }
        this.reset();
        return time;
    }
    return this.offset;
};

export default Timer;
