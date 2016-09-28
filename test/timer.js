import test from 'ava';
import Timer from '../src/timer';
import setup from './helpers/setup-browser-env';
import { wait, when } from './helpers/wait';

test.before(() => {
    return setup();
});

test.beforeEach((t) => {
    t.context.output = document.createElement("output");
    t.context.delta = 50;
});

test.cb("Setup", (t) => {
    const timer = new Timer(10, t.context.output);
    t.is(timer.offset, 10);
    t.is(timer.output, t.context.output);
    t.false(timer.running);
    navigator.mozL10n.once(() => {
        t.is(timer.output.textContent, "0.0s");
        t.end();
    });
});

test("start", (t) => {
    const timer = new Timer(0, t.context.output);
    timer.start();
    t.true(timer.running);
    t.not(timer.startTime, 0);
    timer.stop();
});

test("start event", async (t) => {
    const timer = new Timer(0, t.context.output);
    const promise = when(timer.output, "start");
    timer.start();
    await promise;
    t.pass("Start event fired");
    timer.stop();
});

test("pause", async (t) => {
    const timer = new Timer(0, t.context.output);
    timer.start();
    await wait(1000);
    timer.pause();
    t.false(timer.running);
    t.true(Math.abs(timer.offset - 1000) < t.context.delta);
});

test("pause event", async (t) => {
    const timer = new Timer(0, t.context.output);
    timer.start();
    await wait(1000);
    const promise = when(timer.output, "pause");
    timer.pause();
    const e = await promise;
    t.is(timer.offset, e.detail);
});

test.cb("updateOutput", (t) => {
    const timer = new Timer(0, t.context.output);
    timer.startTime = Date.now() - 1000;
    navigator.mozL10n.once(() => {
        t.is(timer.output.textContent, "1.0s");

        timer.updateOutput(1100);
        navigator.mozL10n.once(() => {
            t.is(timer.output.textContent, "1.1s");
            t.end();
        });
    });
    timer.updateOutput();
});

test("stop", (t) => {
    const timer = new Timer(0, t.context.output);
    timer.start();
    timer.stop();
    t.false(timer.running);
    t.is(timer.startTime, 0);
    t.is(timer.offset, 0);
});

test("stop while not running", (t) => {
    const timer = new Timer(500, t.context.output);
    t.is(timer.stop(), timer.offset);
});

test("stop event", async (t) => {
    const timer = new Timer(0, t.context.output);
    timer.start();
    await wait(100);
    const promise = when(t.context.output, "stop");
    timer.stop();
    const e = await promise;
    t.not(e.detail, 0);
});

test("getTime", (t) => {
    const timer = new Timer(10, t.context.output);
    t.is(timer.getTime(), 10);
    timer.running = true;
    t.true(Math.abs(timer.getTime() - Date.now()) < t.context.delta);
    timer.running = false;
});

test("reset", (t) => {
    const timer = new Timer(0, t.context.output);
    timer.start();
    timer.reset();
    t.false(timer.running);
    t.is(timer.startTime, 0);
    t.is(timer.offset, 0);
});

test("reset event", async (t) => {
    const timer = new Timer(0, t.context.output);
    const promise = when(t.context.output, "reset");
    timer.reset();
    await promise;
    t.pass("Reset event fired");
});
