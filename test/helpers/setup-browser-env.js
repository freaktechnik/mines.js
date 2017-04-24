import { JSDOM } from 'jsdom';
import path from 'path';
import Storage from 'dom-storage';

const dirname = path.dirname(module.filename);
export default (content = "") => {
    return new Promise((resolve) => {
        const env = new JSDOM(`<head>
            <meta name="defaultLanguage" content="en">
            <meta name="availableLanguages" content="en">
            <link rel="localization" href="../test/fixtures/{locale}.properties">
        </head>
        <body>
            ${content}
        </body>`, {
            url: 'file://' + path.resolve(dirname, "../../assets") + "/",
            resources: "usable",
            runScripts: "dangerously"
        });
        global.localStorage = new Storage(null);
        global.window = env.window;
        env.window.localStorage = localStorage;
        env.window.addEventListener("error", (e) => console.error(e.error));
        global.Event = env.window.Event;
        global.CustomEvent = env.window.CustomEvent;
        global.document = env.window.document;
        global.navigator = env.window.navigator;
        global.Element = env.window.Element;
        global.XMLHttpRequest = env.window.XMLHttpRequest;
        require("mutationobserver-shim");
        global.MutationObserver = env.window.MutationObserver;
        require("../../assets/scripts/l10n");
        env.window.navigator.mozL10n.ready(resolve);
    });
};
