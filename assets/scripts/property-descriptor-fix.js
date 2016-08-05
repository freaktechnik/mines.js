const ELEMENT_TAG = 'div',
    nativeDescriptor = Object.getOwnPropertyDescriptor,
    polyfill = function(obj, prop) {
        return {
            get: obj.__lookupGetter__(prop),
            set: obj.__lookupSetter__(prop)
        };
    };

Object.getOwnPropertyDescriptor = function(obj, prop) {
    let ret = nativeDescriptor(obj, prop);
    if(ret !== undefined) {
        return ret;
    }
    else if(prop == 'innerHTML' || prop == 'textContent') {
        ret = nativeDescriptor(document.createElement(ELEMENT_TAG), prop);
        if(ret === undefined) {
            ret = polyfill(obj, prop);

            if(ret === undefined) {
                ret = polyfill(document.createElement(ELEMENT_TAG), prop);
            }
        }
    }
    else {
        ret = polyfill(obj, prop);
    }

    return ret;
};
