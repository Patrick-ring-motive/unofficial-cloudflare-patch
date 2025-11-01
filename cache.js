(() => {
  // Utility function to safely execute functions without throwing
  const Q = fn => {
        try {
            return fn?.()
        } catch {}
    };
    
  // Ensures objects have proper prototype chains for inheritance
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
    
  // Preserves prototype chain when wrapping methods
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
  
  // Add name metadata to cache objects for key tracking
  Q(()=>{caches['&name']='default'});
  Q(()=>{caches.default['&name']='default'});
  
  // KEY TRACKING SYSTEM FOR .keys() POLYFILL
  // Cloudflare Workers doesn't implement Cache.keys(), so we maintain
  // a separate '&keys' cache that stores lists of keys for each cache
  
  // Add keys to the tracking cache when items are stored
  const _put = Cache.prototype.put;
  const _match = Cache.prototype.match;
  const putKeys = async (store,...args)=>{
    try{
      const __keys__ = await caches.open('&keys');
      const url = `https://cache.keys/${encodeURI(store['&name'])}`;
      const keyMatch = await _match.call(__keys__,url);
      let cacheKeys;
      try{
        cacheKeys = await keyMatch.clone().json();
      }catch{}
      cacheKeys ??= [];
      cacheKeys = [...new Set([...cacheKeys,...args])];
      store['&recentKeys'] = cacheKeys;
      return await _put.call(__keys__,url,new Response(JSON.stringify(cacheKeys)));
    }catch(e){
      console.warn(e,...args);
    }
  };

  // Remove keys from the tracking cache when items are deleted
  const deleteKeys = async (store,...args)=>{
    try{
      const __keys__ = await caches.open('&keys');
      const url = `https://cache.keys/${encodeURI(store['&name'])}`;
      const keyMatch = await _match.call(__keys__,url);
      let cacheKeys;
      try{
        cacheKeys = await keyMatch.clone().json();
      }catch{}
      cacheKeys ??= [];
      cacheKeys = cacheKeys.filter(k=>!args.includes(k));
      store['&recentKeys'] = cacheKeys;
      return await _put(__keys__,url,new Response(JSON.stringify(cacheKeys)));
    }catch(e){
      console.warn(e,...args);
    }
  };
  
  // Patch both Cache and CacheStorage prototypes
  // Primary purpose: Handle quota exceeded errors gracefully (make operations no-op instead of throwing)
  // Secondary purpose: Polyfill missing .keys() method in Cloudflare Workers
  for (const cache of [Cache, CacheStorage]) {

    // Patch cache.match to handle quota errors gracefully
    (() => {
      const _match = cache.prototype.match;
      if (!_match) return;
      
      // Returns undefined on error (quota exceeded, invalid request, etc.)
      // This mimics a cache miss, allowing the app to continue without cached data
      cache.prototype.match = extend(async function match(...args) {
        let matched;
        const key = String(args[0]);
        try {
          matched = await _match.apply(this, args);
        } catch (e) {
          console.warn(e, this, ...args);
        }
        this['&recentKeys'] ??= [];
        if(!matched && this['&recentKeys'].includes(key)){
          await deleteKeys(this,key);
        }
        return matched;
      }, _match);
    })();

    // Patch cache.matchAll to handle quota errors gracefully
    (() => {
      const _matchAll = cache.prototype.matchAll;
      if (!_matchAll) return;
      
      // Returns empty array on error, preventing iteration crashes
      cache.prototype.matchAll = extend(async function matchAll(...args) {
        try {
          return await _matchAll.apply(this, args);
        } catch (e) {
          console.warn(e, this, ...args);
          return [];
        }
      }, _matchAll);
    })();

    // Patch cache.add to handle quota errors and track keys
    (() => {
      const _add = cache.prototype.add;
      if (!_add) return;
      
      // On quota exceeded: fails silently, app continues without caching
      // On success: tracks the key for .keys() polyfill
      cache.prototype.add = extend(async function add(...args) {
        let added;
        try {
          added = await _add.apply(this, args);
          const key = String(args[0]?.url ?? args[0]);
          await putKeys(this,key);
        } catch (e) {
          console.warn(e, this, ...args);
        }
        return added;
      }, _add);
    })();

    // Patch cache.addAll to handle quota errors
    (() => {
      const _addAll = cache.prototype.addAll;
      if (!_addAll) return;
      
      // On quota exceeded: fails silently, allows graceful degradation
      cache.prototype.addAll = extend(async function addAll(...args) {
        try {
          return await _addAll.apply(this, args);
        } catch (e) {
          console.warn(e, this, ...args);
        }
      }, _addAll);
    })();

    // Patch cache.put to handle quota errors and track keys
    (() => {
      cache.prototype.put ??= extend(async function put(...args){
        const store = await caches.open('default');
        return await store.put(...args);
      },Cache.prototype.put);
      const _put = cache.prototype.put;
      // On quota exceeded: fails silently, treats cache as best-effort
      // On success: tracks the key for .keys() polyfill
      cache.prototype.put = extend(async function put(...args) {
        let output;
        try {
          output = await _put.apply(this, args);
          const key = String(args[0]?.url ?? args[0]);
          await putKeys(this,key);
        } catch (e) {
          console.warn(e, this, ...args);
        }
        return output;
      }, _put);
    })();

    // Patch cache.delete to handle quota errors and track keys
    (() => {
      const _delete = cache.prototype.delete;
      if (!_delete) return;
      
      // On error: returns false (consistent with "key not found" behavior)
      // On success: removes key from tracking system
      cache.prototype.delete = extend(async function $delete(...args) {
        let del
        try {
          del = await _delete.apply(this, args);
          const key = String(args[0]?.url ?? args[0]);
          await deleteKeys(this,key);
        } catch (e) {
          console.warn(e, this, ...args);
          return false;
        }
        return del;
      }, _delete);
    })();

    // Patch/polyfill cache.keys for Cloudflare Workers
    (() => {
      const _keys = cache.prototype.keys;
      if (!_keys) return;
      
      // POLYFILL: Cloudflare Workers doesn't implement .keys()
      // First tries native implementation (will fail/return empty in CF Workers)
      // Falls back to our custom key tracking system stored in '&keys' cache
      cache.prototype.keys = extend(async function keys(...args) {
        let cacheKeys;
        try {
          cacheKeys = await _keys.apply(this, args);
        } catch (e) {
          console.warn(e, this, ...args);
          cacheKeys = [];
        }
        
        // Fallback to key tracking system if native method returns nothing
        if(!cacheKeys?.length){
          try{
            const __keys__ = await caches.open('&keys');
            const keyMatch = await __keys__.match(`https://cache.keys/${encodeURI(this['&name'])}`);
            cacheKeys = await keyMatch.clone().json();
          }catch(e){
            cacheKeys = [];
          }
        }
        this['&recentKeys'] = cacheKeys;
        return cacheKeys;
      }, _keys);
    })();

    // Patch caches.open to handle quota errors and add cache naming
    (() => {
      const _open = cache.prototype.open;
      if (!_open) return;
      
      // On quota exceeded: returns empty Cache object, operations will no-op
      // Adds '&name' property for key tracking system
      cache.prototype.open = extend(async function open(...args) {
        let store;
        if(String(args[0]).length === 0){
          args[0] = 'default';
        }
        try {
          store = await _open.apply(this, args);
        } catch (e) {
          console.warn(e, this, ...args);
          store = Object.create(Cache.prototype);
        }
        store['&name'] = String(args[0]);
        return store;
      }, _open);
    })();

    // Patch caches.has to handle errors gracefully
    (() => {
      const _has = cache.prototype.has;
      if (!_has) return;
      
      // On error: returns false, allowing graceful fallback
      cache.prototype.has = extend(async function has(...args) {
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
