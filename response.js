(() => {
    const $Response = globalThis.Response;
    (() => {
        const $clone = $Response.prototype.clone;
        $Response.prototype.clone = Object.setPrototypeOf(function clone(...args) {
            try {
                return $clone.apply(this, args);
            } catch (e) {
                console.warn(e, this, ...args);
                return new Response(Object.getOwnPropertyNames(e ?? {}).map(x => `${x} : ${e[x]}`).join('\n'), {
                    status: 500,
                    statusText: `500 Internal Server Error ${e?.message}`
                });
            }
        }, $clone);
    })();
    globalThis.Response = class Response extends $Response {
        constructor(...args) {
            try {
                if (/^(101|204|205|304)$/.test(args?.[1]?.status)) {
                    console.warn('Trying to give a body to in compatible response code 101|204|205|304; body ignored');
                    (args ?? [])[0] = null;
                    delete(args ?? [])[1].body;
                }
                return super(...args);
            } catch (e) {
                console.warn(e, ...args);
                super(Object.getOwnPropertyNames(e ?? {}).map(x => `${x} : ${e[x]}`).join('\n'), {
                    status: 500,
                    statusText: `500 Internal Server Error ${e?.message}`
                });
            }
        }
    }
})();
