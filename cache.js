(() => {

    for (const cache of [Cache, CacheStorage]) {
        // Patch Cache.prototype.match to handle errors gracefully
        (() => {
            // Store reference to the original match method
            const _match = cache.prototype.match;
            if (!_match) return;

            // Override match with error handling wrapper
            cache.prototype.match = Object.setPrototypeOf(async function match(...args) {
                try {
                    // Attempt to call the original match method
                    return await _match.apply(this, args);
                } catch (e) {
                    // If match fails (e.g., invalid request, cache error), log and return undefined
                    // Returning undefined is consistent with cache miss behavior
                    console.warn(e, this, ...args);
                }
            }, _match); // Preserve the original function's prototype chain
        })();

        // Patch Cache.prototype.matchAll to handle errors gracefully
        (() => {
            // Store reference to the original matchAll method
            const _matchAll = cache.prototype.matchAll;
            if (!_matchAll) return;

            // Override matchAll with error handling wrapper
            cache.prototype.matchAll = Object.setPrototypeOf(async function matchAll(...args) {
                try {
                    // Attempt to call the original matchAll method
                    return await _matchAll.apply(this, args);
                } catch (e) {
                    // If matchAll fails, log and return empty array (no matches)
                    // This prevents crashes when iterating over results
                    console.warn(e, this, ...args);
                    return [];
                }
            }, _matchAll);
        })();

        // Patch Cache.prototype.add to handle errors gracefully
        (() => {
            // Store reference to the original add method
            const _add = cache.prototype.add;
            if (!_add) return;

            // Override add with error handling wrapper
            cache.prototype.add = Object.setPrototypeOf(async function add(...args) {
                try {
                    // Attempt to call the original add method (fetches URL and caches response)
                    return await _add.apply(this, args);
                } catch (e) {
                    // If add fails (e.g., network error, invalid URL, fetch failure), log and continue
                    // Returning undefined allows code to continue without cached result
                    console.warn(e, this, ...args);
                }
            }, _add);
        })();

        // Patch Cache.prototype.addAll to handle errors gracefully
        (() => {
            // Store reference to the original addAll method
            const _addAll = cache.prototype.addAll;
            if (!_addAll) return;

            // Override addAll with error handling wrapper
            cache.prototype.addAll = Object.setPrototypeOf(async function addAll(...args) {
                try {
                    // Attempt to call the original addAll method (fetches multiple URLs and caches)
                    return await _addAll.apply(this, args);
                } catch (e) {
                    // If addAll fails (any single fetch fails causes entire operation to fail), log and continue
                    // Allows graceful degradation when bulk caching fails
                    console.warn(e, this, ...args);
                }
            }, _addAll);
        })();

        // Patch Cache.prototype.put to handle errors gracefully
        (() => {
            // Store reference to the original put method
            const _put = cache.prototype.put;
            if (!_put) return;

            // Override put with error handling wrapper
            cache.prototype.put = Object.setPrototypeOf(async function put(...args) {
                try {
                    // Attempt to call the original put method (stores request/response pair in cache)
                    return await _put.apply(this, args);
                } catch (e) {
                    // If put fails (e.g., invalid request/response, quota exceeded), log and continue
                    // Allows code to continue even if caching fails
                    console.warn(e, this, ...args);
                }
            }, _put);
        })();

        // Patch Cache.prototype.delete to handle errors gracefully
        (() => {
            // Store reference to the original delete method
            // Using _delete to avoid reserved keyword conflict
            const _delete = cache.prototype.delete;
            if (!_delete) return;

            // Override delete with error handling wrapper
            // Using _delete as function name since 'delete' is a reserved keyword
            cache.prototype.delete = Object.setPrototypeOf(async function $delete(...args) {
                try {
                    // Attempt to call the original delete method (removes entry from cache)
                    return await _delete.apply(this, args);
                } catch (e) {
                    // If delete fails, log and return false (indicating deletion failed)
                    // This is consistent with the normal return value when entry doesn't exist
                    console.warn(e, this, ...args);
                    return false;
                }
            }, _delete);
        })();

        // Patch Cache.prototype.keys to handle errors gracefully
        (() => {
            // Store reference to the original keys method
            const _keys = cache.prototype.keys;
            if (!_keys) return;
            // Override keys with error handling wrapper
            cache.prototype.keys = Object.setPrototypeOf(async function keys(...args) {
                try {
                    // Attempt to call the original keys method (returns array of cached Request objects)
                    return await _keys.apply(this, args);
                } catch (e) {
                    // If keys fails (e.g., cache access error), log and return empty array
                    // Allows iteration over results without crashing
                    console.warn(e, this, ...args);
                    return [];
                }
            }, _keys);
        })();

        (() => {
            const _open = cache.prototype.open;
            if (!_open) return;
            cache.prototype.open = Object.setPrototypeOf(async function open(...args) {
                try {
                    return await _open.apply(this, args);
                } catch (e) {
                    console.warn(e, this, ...args);
                    return Object.create(Cache.prototype);
                }
            }, _open);
        })();

        (() => {
            const _has = cache.prototype.has;
            if (!_has) return;
            cache.prototype.has = Object.setPrototypeOf(async function has(...args) {
                try {
                    return await _has.apply(this, args);
                } catch (e) {
                    console.warn(e, this, ...args);
                    return false;
                }
            }, _has);
        })();

    }
})();
