    (() => {
        const _URL = globalThis.URL;
        (() => {
            globalThis.URL = extend(function URL(...args) {
                if (new.target) {
                    try {
                        return Reflect.construct(_URL, args, new.target);
                    } catch (e) {
                        console.warn(e, ...args);
                        return Reflect.construct(_URL, [location.origin], new.target);
                    }
                }
                try {
                    return _URL(...args);
                } catch (e) {
                    console.warn(e, ...args);
                    return _URL(location.origin);
                }
            }, _URL);
        })();
    })();
