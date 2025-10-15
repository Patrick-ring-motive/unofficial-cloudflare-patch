(() => {
    const Extends = (thisClass, superClass) => {
        try {
            Object.setPrototypeOf(thisClass, superClass);
            Object.setPrototypeOf(
                thisClass.prototype,
                superClass?.prototype ??
                superClass?.constructor?.prototype ??
                superClass
            );
        } catch (e) {
            console.warn(e, {
                thisClass,
                superClass
            });
        }
        return thisClass;
    };
    const _RegExp = globalThis.RegExp;
    (() => {
        globalThis.RegExp = Extends(function RegExp(...args) {
            if (new.target) {
                try {
                    return Reflect.construct(_RegExp, args, new.target);
                } catch (e) {
                    console.warn(e, ...args);
                    return Reflect.construct(_RegExp, [/$a^/], new.target);
                }
            }
            try {
                return _RegExp(...args);
            } catch (e) {
                console.warn(e, ...args);
                return _RegExp(/$a^/);
            }
        }, _RegExp);
    })();
})();
