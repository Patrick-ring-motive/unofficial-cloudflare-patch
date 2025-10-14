     (() => {
         const _Request = globalThis.Request;
         (() => {
             const $clone = _Request.prototype.clone;
             _Request.prototype.clone = Object.setPrototypeOf(function clone(...args) {
                 try {
                     return $clone.apply(this, args);
                 } catch (e) {
                     console.warn(e, this, ...args);
                     return new Response(Object.getOwnPropertyNames(e ?? {}).map(x => `${x} : ${e[x]}`).join('\n'), {
                         status: 400,
                         statusText: `400 Bad Request ${e?.message}`
                     });
                 }
             }, $clone);
         })();
         globalThis.Request = new Proxy(_Request, {
             construct(target, args, newTarget) {
                 try {
                     return Reflect.construct(target, args, newTarget)
                 } catch (e) {
                     console.warn(e, ...args);
                     return new Response(Object.getOwnPropertyNames(e ?? {}).map(x => `${x} : ${e[x]}`).join('\n'), {
                         status: 400,
                         statusText: `400 Bad Request ${e?.message}`
                     });
                 }
             }
         });
     })();
