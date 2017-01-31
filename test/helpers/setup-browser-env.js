import { env, createVirtualConsole } from 'jsdom';
import path from 'path';
import Storage from 'dom-storage';

const virtualConsole = createVirtualConsole().sendTo(console);
const dirname = path.dirname(module.filename);
export default (content = "") => {
    return new Promise((resolve, reject) => {
        env({
            html: `<head>
    <meta name="defaultLanguage" content="en">
    <meta name="availableLanguages" content="en">
    <link rel="localization" href="../test/fixtures/{locale}.properties">
</head>
<body>
    ${content}
</body>`,
            scripts: [
                'scripts/l10n.js',
                require.resolve('mutationobserver-shim')
            ],
            url: 'file://' + path.resolve(dirname, "../../assets") + "/",
            created(err, window) {
                global.localStorage = new Storage(null);
                global.window = window;
                window.localStorage = localStorage;
                window.addEventListener("error", (e) => console.error(e.error));
            },
            done(err, window) {
                if(err) {
                    reject(err);
                }
                else {
                    global.Event = window.Event;
                    global.CustomEvent = window.CustomEvent;
                    global.document = window.document;
                    global.navigator = window.navigator;
                    global.Element = window.Element;
                    window.navigator.mozL10n.ready(resolve);
                }
            },
            features: {
                FetchExternalResources: [ "script", "link" ],
                ProcessExternalResources: [ "script" ]
            },
            virtualConsole
        });
    });
};
