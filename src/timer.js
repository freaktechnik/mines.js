/**
 * Timer thing
 */

Timer.prototype.output = null;
Timer.prototype.startTime = 0;
Timer.prototype.offset = 0;
Timer.prototype.interval = 0;
Timer.prototype.running = false;
function Timer(offset, output) {
    this.offset = offset;
    this.output = output;
}

Timer.prototype.updateOutput = function(time) {
    time = time || Date.now() - this.startTime;
    this.output.value = (time/1000.0).toFixed(1);
};

Timer.prototype.reset = function() {
    this.startTime = 0;
    this.offset = 0;
    this.updateOutput(0.00001);
    this.running = false;
    if(this.interval) {
        clearInterval(this.interval);
        this.interval = 0;
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
        var time = Date.now() - this.startTime;
        this.running = false;
        if(this.interval) {
            clearInterval(this.interval);
            this.interval = 0;
            this.updateOutput(time);
            this.output.dispatchEvent(new CustomEvent("stop", { detail: time }));
        }
        this.reset();
        return time;
    }
};
