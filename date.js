(() => {
    const extend = (thisClass, superClass) => {
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
    let $start = 0;
    let $now = 0;
    let $last = 0;
    let $timer = 0;
    globalThis.$ticks = 0;
    const _Date = globalThis.Date;
    const _getTime = () => Reflect.construct(_Date, []).getTime();
    (() => {
        const _now = _Date.now ?? Function.prototype;
        _Date.now = extend(function now() {
            const _time = _getTime();
            if (!$now) {
                $now = _time;
                $last = $now;
                $start = $now;
            }
            if ($last != _time) {
                $ticks = _time - $start;
                $last = _time;
                $now = $last;
                try {
                    clearInterval($timer);
                } catch (e) {
                    console.warn(e);
                }
                $timer = 0;
            }
            if (!$timer) {
                try {
                    $timer = setInterval(() => {
                        $ticks++;
                        $now = $start + $ticks;
                    }, 1);
                } catch (e) {
                    console.warn(e);
                }
            }
            return $now;
        }, _now);
    })();
    (() => {
        const _now = performance.now ?? Function.prototype;
        performance.now = extend(function now() {
            return _Date.now();
        }, _now);
    })();
    globalThis.Date = extend(function Date(...args) {
        _Date.now();
        if (new.target) {
            if (!args?.length) {
                return Reflect.construct(_Date, [$now], new.target);
            }
            return Reflect.construct(_Date, args, new.target);
        } else {
            if (!args?.length) {
                return _Date($now);
            }
            return _Date(...args);
        }
    },_Date);
})();
