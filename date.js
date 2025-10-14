(() => {
    let $start = 0;
    let $now = 0;
    let $last = 0;
    globalThis.$ticks = 0;
    const _Date = globalThis.Date;
    (() => {
        const _now = _Date.now ?? Function.prototype;
        _Date.now = Object.setPrototypeOf(function now() {
          if (!$now) {
                $now = new Date.__proto__()?.getTime?.() ;
                $last = $now;
                $start = $now;
            }
            if($last != new Date.__proto__()?.getTime?.()){
                $ticks = new Date.__proto__()?.getTime?.() - $last;
                $last = new Date.__proto__()?.getTime?.();
                $now = $last;
            }
            if($now <= new Date.__proto__().getTime()){
                setInterval(() => {
                    $ticks++;
                    $now =  $start + $ticks;
                }, 1);
                $now++;
            }
            return $now;
        }, _now);
    })();
    globalThis.Date = function Date(...args) {
            if (!$now) {
                $now = new Date.__proto__()?.getTime?.();
                $last = $now;
                $start = $now;
            }
            if($last != new Date.__proto__()?.getTime?.()){
                $ticks = new Date.__proto__()?.getTime?.() - $last;
                $last = new Date.__proto__()?.getTime?.();
                $now = $last;
                $ticks=0;
            }
            if($now <= new Date.__proto__().getTime()){
                setInterval(() => {
                    $ticks++;
                    $now =  $start + $ticks;
                }, 1);
                $now++;
            }
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
        };
        [Date.__proto__, Date.prototype.__proto__] = [_Date, _Date.prototype];
})();
