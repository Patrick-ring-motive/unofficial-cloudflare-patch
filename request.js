     (() => {
         const _Request = globalThis.Request;
         (() => {
             const _clone = _Request.prototype.clone;
             _Request.prototype.clone = Object.setPrototypeOf(function clone(...args) {
                 try {
                     return _clone.apply(this, args);
                 } catch (e) {
                     console.warn(e, this, ...args);
                     return Object.create(Request.prototype);
                 }
             }, _clone);
         })();
         (() => {
             const _body = Object.getOwnPropertyDescriptor(_Request.prototype, 'body');
             if (!_body?.get) return;
             const $body = _body.get;
             const bodyDescriptor = Object.setPrototypeOf({
                 get: Object.setPrototypeOf(function body(...args) {
                     try {
                         return $body.apply(this, args);
                     } catch (e) {
                         console.warn(e, this, ...args);
                         return null;
                     }
                 }, $body)
             }, _body);
             console.log(bodyDescriptor);
             Object.defineProperty(_Request.prototype, 'body', bodyDescriptor);
         })();
         globalThis.Request = new Proxy(_Request, {
             construct(target, args, newTarget) {
                 try {
                     return Reflect.construct(target, args, newTarget)
                 } catch (e) {
                     console.warn(e, ...args);
                     return Object.create(Request.prototype);
                 }
             }
         });
     })();
