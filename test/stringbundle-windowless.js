import test from 'ava';
import StringBundle from '../src/stringbundle';

test("Can not construct when mozL10n is missing", (t) => {
    global.navigator = {};
    t.throws(() => {
        new StringBundle({
            setAttribute() {
                // Emptyness
            }
        });
    }, "mozL10n global not initialized.");
});
