// Patch Cache.prototype.match to handle errors gracefully
(() => {
  // Store reference to the original match method
  const $match = Cache.prototype.match;
  
  // Override match with error handling wrapper
  Cache.prototype.match = Object.setPrototypeOf(async function match(...args) {
    try {
      // Attempt to call the original match method
      return await $match.apply(this, args);
    } catch (e) {
      // If match fails (e.g., invalid request, cache error), log and return undefined
      // Returning undefined is consistent with cache miss behavior
      console.warn(e, this, ...args);
    }
  }, $match); // Preserve the original function's prototype chain
})();

// Patch Cache.prototype.matchAll to handle errors gracefully
(() => {
  // Store reference to the original matchAll method
  const $matchAll = Cache.prototype.matchAll;
  
  // Override matchAll with error handling wrapper
  Cache.prototype.matchAll = Object.setPrototypeOf(async function matchAll(...args) {
    try {
      // Attempt to call the original matchAll method
      return await $matchAll.apply(this, args);
    } catch (e) {
      // If matchAll fails, log and return empty array (no matches)
      // This prevents crashes when iterating over results
      console.warn(e, this, ...args);
      return [];
    }
  }, $matchAll);
})();

// Patch Cache.prototype.add to handle errors gracefully
(() => {
  // Store reference to the original add method
  const $add = Cache.prototype.add;
  
  // Override add with error handling wrapper
  Cache.prototype.add = Object.setPrototypeOf(async function add(...args) {
    try {
      // Attempt to call the original add method (fetches URL and caches response)
      return await $add.apply(this, args);
    } catch (e) {
      // If add fails (e.g., network error, invalid URL, fetch failure), log and continue
      // Returning undefined allows code to continue without cached result
      console.warn(e, this, ...args);
    }
  }, $add);
})();

// Patch Cache.prototype.addAll to handle errors gracefully
(() => {
  // Store reference to the original addAll method
  const $addAll = Cache.prototype.addAll;
  
  // Override addAll with error handling wrapper
  Cache.prototype.addAll = Object.setPrototypeOf(async function addAll(...args) {
    try {
      // Attempt to call the original addAll method (fetches multiple URLs and caches)
      return await $addAll.apply(this, args);
    } catch (e) {
      // If addAll fails (any single fetch fails causes entire operation to fail), log and continue
      // Allows graceful degradation when bulk caching fails
      console.warn(e, this, ...args);
    }
  }, $addAll);
})();

// Patch Cache.prototype.put to handle errors gracefully
(() => {
  // Store reference to the original put method
  const $put = Cache.prototype.put;
  
  // Override put with error handling wrapper
  Cache.prototype.put = Object.setPrototypeOf(async function put(...args) {
    try {
      // Attempt to call the original put method (stores request/response pair in cache)
      return await $put.apply(this, args);
    } catch (e) {
      // If put fails (e.g., invalid request/response, quota exceeded), log and continue
      // Allows code to continue even if caching fails
      console.warn(e, this, ...args);
    }
  }, $put);
})();

// Patch Cache.prototype.delete to handle errors gracefully
(() => {
  // Store reference to the original delete method
  // Using _delete to avoid reserved keyword conflict
  const _delete = Cache.prototype.delete;
  
  // Override delete with error handling wrapper
  // Using $delete as function name since 'delete' is a reserved keyword
  Cache.prototype.delete = Object.setPrototypeOf(async function $delete(...args) {
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
  const $keys = Cache.prototype.keys;
  
  // Override keys with error handling wrapper
  Cache.prototype.keys = Object.setPrototypeOf(async function keys(...args) {
    try {
      // Attempt to call the original keys method (returns array of cached Request objects)
      return await $keys.apply(this, args);
    } catch (e) {
      // If keys fails (e.g., cache access error), log and return empty array
      // Allows iteration over results without crashing
      console.warn(e, this, ...args);
      return [];
    }
  }, $keys);
})();
