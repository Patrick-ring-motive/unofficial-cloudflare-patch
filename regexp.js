(() => {
  // Utility function to safely execute functions without throwing
  const Q = fn => {
        try {
            return fn?.()
        } catch {}
    };
    
  // Ensures objects have proper prototype chains for inheritance
  const constructPrototype = newClass => {
        try {
            if (newClass?.prototype) return newClass;
            const constProto = newClass?.constructor?.prototype;
            if (constProto) {
                newClass.prototype = Q(() => constProto?.bind?.(constProto)) ?? Object.create(Object(constProto));
                return newClass;
            }
            newClass.prototype = Q(() => newClass?.bind?.(newClass)) ?? Object.create(Object(newClass));
        } catch (e) {
            console.warn(e, newClass);
        }
    };
    
  // Preserves prototype chain when wrapping methods
  const extend = (thisClass, superClass) => {
        try {
            constructPrototype(thisClass);
            constructPrototype(superClass);
            Object.setPrototypeOf(
                thisClass.prototype,
                superClass?.prototype ??
                superClass?.constructor?.prototype ??
                superClass
            );
            Object.setPrototypeOf(thisClass, superClass);

        } catch (e) {
            console.warn(e, {
                thisClass,
                superClass
            });
        }
        return thisClass;
    };
    (() => {
        const _RegExp = globalThis.RegExp;
        (() => {
            globalThis.RegExp = extend(function RegExp(...args) {
                if (new.target) {
                    try {
                        return Reflect.construct(_RegExp, args, new.target);
                    } catch (e) {
                        console.warn(e, ...args);
                        return Reflect.construct(_RegExp, [/$RegExp^/], new.target);
                    }
                }
                try {
                    return _RegExp(...args);
                } catch (e) {
                    console.warn(e, ...args);
                    return _RegExp(/$RegExp^/);
                }
            }, _RegExp);
        })();
    })();
})();
