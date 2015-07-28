/**
 * Timer thing
 */

var TIME_UNIT_STRING = "mines_time_unit";

Timer.prototype.output = null;
Timer.prototype.startTime = 0;
Timer.prototype.offset = 0;
Timer.prototype.interval = 0;
Timer.prototype.running = false;
function Timer(offset, output) {
    this.offset = offset;
    this.output = output;

    var time = "0.0";
    if("Intl" in window) {
        this._nf = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
        time = this._nf.format(0.0);
    }

    navigator.mozL10n.setAttributes(this.output, TIME_UNIT_STRING, { time: time });
    navigator.mozL10n.translateFragment(this.output);
}

Timer.prototype.updateOutput = function(time) {
    if(typeof(time) !== "number")
        time = Date.now() - this.startTime;

    var timeStr;
    if(this._nf) {
        timeStr = this._nf.format(time / 1000.0);
    }
    else {
        timeStr = (time/1000.0).toFixed(1);
    }

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
    if(!this.running)
        return this.offset;
    else
        return Date.now() - this.startTime;
};

Timer.prototype.start = function() {
    if(!this.running) {
        this.startTime = Date.now() - this.offset;
        this.running = true;
        if(this.output) {
            var that = this;
            this.interval = setInterval(function() {
                that.updateOutput();
            }, 100);
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
        var time = Date.now() - this.startTime;
        this.running = false;
        if(this.interval) {
            clearInterval(this.interval);
            this.interval = 0;
            this.output.dispatchEvent(new CustomEvent("stop", { detail: time }));
        }
        this.reset();
        return time;
    }
};
