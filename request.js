(() => {
    // Store a reference to the original Response constructor before we modify it
    const _Request = globalThis.Request;
    
    // Patch the Response.prototype.clone method to handle errors gracefully
    (() => {
        // Store reference to the original clone method
        const $clone = _Request.prototype.clone;
        
        // Override the clone method with error handling
        _Request.prototype.clone = Object.setPrototypeOf(function clone(...args) {
            try {
                // Attempt to call the original clone method
                return $clone.apply(this, args);
            } catch (e) {
                // If clone fails, log the error and return a 500 error response
                // instead of throwing, which prevents crashes
                console.warn(e, this, ...args);
                return new Response(Object.getOwnPropertyNames(e ?? {}).map(x => `${x} : ${e[x]}`).join('\n'), {
                    status: 400,
                    statusText: `400 Bad Request ${e?.message}`
                });
            }
        }, $clone); // Preserve the original function's prototype chain
    })();
    
    // Replace the global Response constructor with a patched version
    globalThis.Request = class Request {
        constructor(...args) {
            try {
                return Reflect.construct(_Request,args,this);
            } catch (e) {
                console.warn(e, ...args);
                return Reflect.construct(Response,[Object.getOwnPropertyNames(e ?? {}).map(x => `${x} : ${e[x]}`).join('\n'), {
                    status: 400,
                    statusText: `400 Bad Request ${e?.message}`
                }],this);
            }
        }
    }
})();
