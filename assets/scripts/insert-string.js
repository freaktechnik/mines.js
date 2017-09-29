const attrMap = {
        "aria-label": "ariaLabel"
    },
    translateElement = (bundle, id, options, attr, simple = false) => {
        if(simple) {
            return bundle[id];
        }

        let str = ` data-l10n-id="${id}">`,
            string = bundle[id] || bundle[`${id}.innerHTML`];
        if(attr && !(attr in attrMap)) {
            string = bundle[`${id}.${attr}`];
        }
        else if(attr && attr in attrMap) {
            string = bundle[`${id}.${attrMap[attr]}`];
        }

        if(!string || !string.trim().length) {
            throw new Error(`Empty string ${id}`);
        }

        if(options) {
            for(const opt in options) {
                string = string.replace(new RegExp(`{{${opt}}}`, "g"), options[opt]);
            }
            str = ` data-l10n-args='${JSON.stringify(options)}'${str}`;
        }

        if(!attr) {
            str += string;
        }
        else {
            str = ` ${attr}="${string}"${str}`;
        }

        return str;
    };

export default (defaultLanguage) => {
    const bundle = require(`!!properties-loader!../../locales/${defaultLanguage}/app.properties`);

    return translateElement.bind(null, bundle);
};
