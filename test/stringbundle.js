import test from 'ava';
import setup from './helpers/setup-browser-env';
import StringBundle from '../src/stringbundle';

const STRINGS = [
    {
        id: "mines_restore_error",
        value: "Could not restore saved game."
    },
    {
        id: "mines_new_highscore",
        value: "High score! Please enter a name if you want to save it."
    },
    {
        id: "highscores_custom_board",
        args: {
            width: 10,
            height: 9,
            mines: 8
        },
        value: "10x9 with 8 mines"
    },
    {
        id: "mines_time_unit",
        args: {
            time: "0.0"
        },
        value: "0.0s"
    }
];

test.before(() => setup(`<div id="strings">
    <span data-l10n-id="mines_restore_error"></span>
    <span data-l10n-id="mines_new_highscore"></span>
    <span data-l10n-id="highscores_custom_board"></span>
    <span data-l10n-id="mines_time_unit"></span>
</div>`));

test.beforeEach((t) => {
    t.context.strbundle = new StringBundle(document.getElementById("strings"));
});

test("sync", (t) => {
    STRINGS.forEach((string) => {
        if(!("args" in string)) {
            t.is(t.context.strbundle.getString(string.id), string.value);
        }
    });
});

const testAsync = async (t, string) => {
    const p = await t.context.strbundle.getStringAsync(string.id, string.args);
    t.is(p, string.value);
};
testAsync.title = (providedTitle, string) => `${providedTitle}: ${string.id}`;

STRINGS.forEach((s) => test("async", testAsync, s));

test("async same string", (t) => {
    const args = [
        {
            arg: "1.23",
            val: "1.23s"
        },
        {
            arg: "0.1",
            val: "0.1s"
        },
        {
            arg: "abc",
            val: "abcs"
        }
    ];
    return Promise.all(args.map(async (argument) => {
        const val = await t.context.strbundle.getStringAsync("mines_time_unit", { time: argument.arg });
        t.is(val, argument.val);
        return val;
    }));
});
