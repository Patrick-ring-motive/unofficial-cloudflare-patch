(() => {
    // Cache variable to store the current timestamp
    // Cloudflare Workers freeze Date() to the request start time by default
    // This patch makes Date() return the actual current time during execution
    let now;
    
    // Store a reference to the original (frozen) Date constructor
    const $Date = globalThis.Date;
    
    // Patch Date.now() to use our advancing timestamp instead of frozen time
    const $now = $Date.now;
    $Date.now = Object.setPrototypeOf(function now() {
        // Delegate to new Date().getTime() which will use our cached, incrementing timestamp
        return new Date().getTime();
    }, $now); // Preserve the original function's prototype chain
    
    // Replace the global Date constructor with a patched version that advances time
    globalThis.Date = class Date extends $Date {
        constructor(...args) {
            // Initialize the timer on first Date instantiation in this request
            if (!now) {
                // Get the request start time from the frozen Date
                now = new $Date().getTime();
                
                // Start an interval that increments the cached time every 1ms
                // This simulates real time progression during the request lifecycle
                // Note: setInterval in Workers continues to run during the request
                setInterval(() => now++, 1);
            }
            
            // If no arguments provided (i.e., new Date()), return current advancing time
            // instead of the frozen request start time
            if (!args?.length) {
                return super(now);
            }
            
            // If arguments provided (specific date/time), pass through to original Date
            // e.g., new Date('2024-01-01') or new Date(2024, 0, 1)
            return super(...args);
        }
    }
})();
