(() => {
    // Cache variable to store the current timestamp
    // Cloudflare Workers freeze Date() to the request start time by default
    // This patch makes Date() return the actual current time during execution
    let now;
    // Store a reference to the original (frozen) Date constructor
    const _Date = globalThis.Date;
    (() => {
        // Patch Date.now() to use our advancing timestamp instead of frozen time
        const _now = _Date.now;
        _Date.now = Object.setPrototypeOf(function now() {
            // Delegate to new Date().getTime() which will use our cached, incrementing timestamp
            return new Date().getTime();
        }, _now); // Preserve the original function's prototype chain
    })();
    globalThis.Date = function Date(...args) {
            // Initialize the timer on first Date instantiation in this request
            if (!now) {
                // Get the request start time from the frozen Date
                now = new _Date().getTime();
                // Start an interval that increments the cached time by 10 every 10ms
                // This simulates real time progression during the request lifecycle
                // Note: setInterval in Workers continues to run during the request
                setInterval(() => {
                    now = Math.max(now + 10, new _Date.getTime());
                }, 10);
            }
            if (new.target) {
                // If no arguments provided (i.e., new Date()), return current advancing time
                // instead of the frozen request start time
                if (!args?.length) {
                    return Reflect.construct(_Date, [now], new.target);;
                }
                // If arguments provided (specific date/time), pass through to original Date
                // e.g., new Date('2024-01-01') or new Date(2024, 0, 1)
                return Reflect.construct(_Date, args, new.target);
            } else {
                if (!args?.length) {
                    return _Date(now);
                }
                return _Date(...args);
            }
        }
        [Date.__proto__, Date.prototype.__proto__] = [_Date.__proto__, _Date.prototype.__proto__];
})();
