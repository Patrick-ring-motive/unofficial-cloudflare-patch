(() => {
  const Q = fn => {
        try {
            return fn?.()
        } catch {}
    };
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
  // Patch both Cache and CacheStorage prototypes with error handling
  // This ensures all cache operations are resilient across both APIs
  for (const cache of [Cache, CacheStorage]) {

    // Patch cache.match to handle errors gracefully
    (() => {
      // Store reference to the original match method
      const _match = cache.prototype.match;
      // Skip if method doesn't exist on this prototype
      if (!_match) return;
      
      // Override match with error handling wrapper
      cache.prototype.match = extend(async function match(...args) {
        try {
          // Attempt to call the original match method
          return await _match.apply(this, args);
        } catch (e) {
          // If match fails (e.g., invalid request, cache error, quota exceeded), 
          // log and return undefined. Returning undefined is consistent with cache miss behavior
          console.warn(e, this, ...args);
        }
      }, _match); // Preserve the original function's prototype chain
    })();

    // Patch cache.matchAll to handle errors gracefully
    (() => {
      // Store reference to the original matchAll method
      const _matchAll = cache.prototype.matchAll;
      // Skip if method doesn't exist on this prototype
      if (!_matchAll) return;
      
      // Override matchAll with error handling wrapper
      cache.prototype.matchAll = extend(async function matchAll(...args) {
        try {
          // Attempt to call the original matchAll method
          return await _matchAll.apply(this, args);
        } catch (e) {
          // If matchAll fails (e.g., cache error, quota exceeded), log and return empty array
          // This prevents crashes when iterating over results
          console.warn(e, this, ...args);
          return [];
        }
      }, _matchAll);
    })();

    // Patch cache.add to handle errors gracefully
    (() => {
      // Store reference to the original add method
      const _add = cache.prototype.add;
      // Skip if method doesn't exist on this prototype
      if (!_add) return;
      
      // Override add with error handling wrapper
      cache.prototype.add = extend(async function add(...args) {
        try {
          // Attempt to call the original add method (fetches URL and caches response)
          return await _add.apply(this, args);
        } catch (e) {
          // If add fails (e.g., network error, quota exceeded, invalid URL), log and continue
          // Returning undefined allows code to continue without cached result
          console.warn(e, this, ...args);
        }
      }, _add);
    })();

    // Patch cache.addAll to handle errors gracefully
    (() => {
      // Store reference to the original addAll method
      const _addAll = cache.prototype.addAll;
      // Skip if method doesn't exist on this prototype
      if (!_addAll) return;
      
      // Override addAll with error handling wrapper
      cache.prototype.addAll = extend(async function addAll(...args) {
        try {
          // Attempt to call the original addAll method (fetches multiple URLs and caches)
          return await _addAll.apply(this, args);
        } catch (e) {
          // If addAll fails (quota exceeded, any single fetch fails), log and continue
          // Allows graceful degradation when bulk caching fails
          console.warn(e, this, ...args);
        }
      }, _addAll);
    })();

    // Patch cache.put to handle errors gracefully
    (() => {
      // Store reference to the original put method
      const _put = cache.prototype.put;
      // Skip if method doesn't exist on this prototype
      if (!_put) return;
      
      // Override put with error handling wrapper
      cache.prototype.put = extend(async function put(...args) {
        try {
          // Attempt to call the original put method (stores request/response pair in cache)
          return await _put.apply(this, args);
        } catch (e) {
          // If put fails (e.g., quota exceeded, invalid request/response), log and continue
          // Allows code to continue even if caching fails - treats cache as best-effort
          console.warn(e, this, ...args);
        }
      }, _put);
    })();

    // Patch cache.delete to handle errors gracefully
    (() => {
      // Store reference to the original delete method
      // Using _delete to avoid reserved keyword conflict
      const _delete = cache.prototype.delete;
      // Skip if method doesn't exist on this prototype
      if (!_delete) return;
      
      // Override delete with error handling wrapper
      // Using $delete as function name since 'delete' is a reserved keyword
      cache.prototype.delete = extend(async function $delete(...args) {
        try {
          // Attempt to call the original delete method (removes entry from cache)
          return await _delete.apply(this, args);
        } catch (e) {
          // If delete fails (e.g., cache access error), log and return false
          // Returning false is consistent with the normal return value when entry doesn't exist
          console.warn(e, this, ...args);
          return false;
        }
      }, _delete);
    })();

    // Patch cache.keys to handle errors gracefully
    (() => {
      // Store reference to the original keys method
      const _keys = cache.prototype.keys;
      // Skip if method doesn't exist on this prototype
      if (!_keys) return;
      
      // Override keys with error handling wrapper
      cache.prototype.keys = extend(async function keys(...args) {
        try {
          // Attempt to call the original keys method (returns array of cached Request objects)
          return await _keys.apply(this, args);
        } catch (e) {
          // If keys fails (e.g., cache access error, quota issues), log and return empty array
          // Allows iteration over results without crashing
          console.warn(e, this, ...args);
          return [];
        }
      }, _keys);
    })();

    // Patch caches.open (CacheStorage method) to handle errors gracefully
    (() => {
      // Store reference to the original open method
      const _open = cache.prototype.open;
      // Skip if method doesn't exist (this is CacheStorage-specific)
      if (!_open) return;
      
      // Override open with error handling wrapper
      cache.prototype.open = extend(async function open(...args) {
        let store;
        try {
          // Attempt to open the named cache
          store = await _open.apply(this, args);
        } catch (e) {
          // If open fails (e.g., quota exceeded, invalid name), log and return empty Cache object
          // Returning an empty Cache allows code to continue with cache operations that will no-op
          console.warn(e, this, ...args);
          store = Object.create(Cache.prototype);
        }
        store['&name'] = String(args[0]);
      }, _open);
    })();

    // Patch caches.has (CacheStorage method) to handle errors gracefully
    (() => {
      // Store reference to the original has method
      const _has = cache.prototype.has;
      // Skip if method doesn't exist (this is CacheStorage-specific)
      if (!_has) return;
      
      // Override has with error handling wrapper
      cache.prototype.has = extend(async function has(...args) {
        try {
          // Attempt to check if named cache exists
          return await _has.apply(this, args);
        } catch (e) {
          // If has fails (e.g., cache access error), log and return false
          // Returning false indicates cache doesn't exist, allowing graceful fallback
          console.warn(e, this, ...args);
          return false;
        }
      }, _has);
    })();
  }
})();
