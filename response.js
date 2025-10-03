(() => {
    // Store a reference to the original Response constructor before we modify it
    const _Response = globalThis.Response;
    
    // Patch the Response.prototype.clone method to handle errors gracefully
    (() => {
        // Store reference to the original clone method
        const $clone = _Response.prototype.clone;
        
        // Override the clone method with error handling
        _Response.prototype.clone = Object.setPrototypeOf(function clone(...args) {
            try {
                // Attempt to call the original clone method
                return $clone.apply(this, args);
            } catch (e) {
                // If clone fails, log the error and return a 500 error response
                // instead of throwing, which prevents crashes
                console.warn(e, this, ...args);
                return new Response(Object.getOwnPropertyNames(e ?? {}).map(x => `${x} : ${e[x]}`).join('\n'), {
                    status: 569,
                    statusText: `500 Internal Server Error ${e?.message}`
                });
            }
        }, $clone); // Preserve the original function's prototype chain
    })();
    
    // Replace the global Response constructor with a patched version
    globalThis.Response = class Response extends _Response {
        constructor(...args) {
            try {
                // Check if the status code is one that MUST NOT have a body per HTTP spec
                // 101 Switching Protocols, 204 No Content, 205 Reset Content, 304 Not Modified
                if (/^(101|204|205|304)$/.test(args?.[1]?.status)) {
                    console.warn('Trying to give a body to incompatible response code 101|204|205|304; body ignored');
                    // Remove the body parameter (first argument) to comply with HTTP spec
                    (args ?? [])[0] = null;
                    // Also delete the body property from the options object if present
                    delete(args?.[1] ?? {}).body;
                }
                // Call the original Response constructor with potentially modified args
                return super(...args);
            } catch (e) {
                // If Response construction fails, log the error and create a 500 error response
                // This prevents the error from bubbling up and crashing the application
                console.warn(e, ...args);
                return super(Object.getOwnPropertyNames(e ?? {}).map(x => `${x} : ${e[x]}`).join('\n'), {
                    status: 569,
                    statusText: `500 Internal Server Error ${e?.message}`
                });
            }
        }
    }
})();
