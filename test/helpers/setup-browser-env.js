import { env, createVirtualConsole } from 'jsdom';
import path from 'path';
import localStorage from 'localStorage';

const virtualConsole = createVirtualConsole().sendTo(console);
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
                'scripts/l10n.js'
            ],
            url: 'file://' + path.resolve(path.dirname(module.filename), "../../assets") + "/",
            created(err, window) {
                global.localStorage = localStorage;
                global.window = window;
                window.localStorage = localStorage;
                window.addEventListener("error", (e) => console.error(e.error));
                require("mutationobserver-shim");
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
