(() => {
    const $fetch = globalThis.fetch;
    globalThis.fetch = Object.setPrototypeOf(async function fetch(...args) {
        let response;
        try {
            response = $fetch(...args);
        } catch (e) {
            console.warn(e, ...args);
            return new Response(Object.getOwnPropertyNames(e ?? {}).map(x => `${x} : ${e[x]}`).join('\n'), {
                status: 400,
                statusText: `400 Bad Request ${e?.message}`
            });
        }
        try {
            return await response;
        } catch (e) {
            console.warn(e, ...args);
            return new Response(Object.getOwnPropertyNames(e ?? {}).map(x => `${x} : ${e[x]}`).join('\n'), {
                status: 500,
                statusText: `500 Internal Server Error ${e?.message}`
            });
        }
    }, $fetch);
})();
