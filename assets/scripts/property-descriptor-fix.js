var nativeDescriptor = Object.getOwnPropertyDescriptor;

Object.getOwnPropertyDescriptor = function(obj, prop) {
    var ret = nativeDescriptor(obj, prop);
    if(ret !== undefined) {
        return ret;
    }
    else if(prop == 'innerHTML') {
        return nativeDescriptor(document.createElement('div'), prop);
    }
    else if(prop == 'textContent') {
        return nativeDescriptor(document.createElement('div'), prop);
    }
};
