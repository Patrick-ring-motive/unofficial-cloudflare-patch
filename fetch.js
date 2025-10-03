(() => {
    // Store a reference to the original fetch function before we override it
    const _fetch = globalThis.fetch;
    
    // Replace the global fetch with a patched version that handles errors gracefully
    globalThis.fetch = Object.setPrototypeOf(async function fetch(...args) {
        let response;
        
        try {
            // Attempt to call the original fetch function
            // Note: fetch returns a Promise, so errors here are typically synchronous
            // (e.g., invalid arguments, malformed URLs)
            response = _fetch(...args);
        } catch (e) {
            // If fetch throws synchronously (bad request setup), log and return 400
            // This catches errors like invalid URL format or bad fetch arguments
            console.warn(e, ...args);
            return new Response(Object.getOwnPropertyNames(e ?? {}).map(x => `${x} : ${e[x]}`).join('\n'), {
                status: 400,
                statusText: `400 Bad Request ${e?.message}`
            });
        }
        
        try {
            // Await the fetch promise to get the actual response
            // This catches network errors, timeouts, and other async failures
            return await response;
        } catch (e) {
            // If the fetch promise rejects (network error, timeout, DNS failure, etc.),
            // log and return 500 instead of throwing
            // This prevents unhandled promise rejections from crashing the worker
            console.warn(e, ...args);
            return new Response(Object.getOwnPropertyNames(e ?? {}).map(x => `${x} : ${e[x]}`).join('\n'), {
                status: 500,
                statusText: `500 Internal Server Error ${e?.message}`
            });
        }
    }, _fetch); // Preserve the original function's prototype chain
})();
