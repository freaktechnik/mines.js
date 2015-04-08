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
    this.output.value = Math.round(time/1000, 2);
};

Timer.prototype.start = function() {
    if(!this.running) {
        this.startTime = Date.now() - this.offset;
        this.running = true;
        if(this.output) {
            this.interval = setInterval(this.updateOutput().bind(this), 10);
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
            this.updateOutput(time);
            this.output.dispatchEvent(new CustomEvent("stop", { detail: time }));
        }
        return time;
    }
};
