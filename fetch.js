(()=>{
    const $fetch = globalThis.fetch;
    globalThis.fetch = Object.setPrototypeOf(async function fetch(...args){
      let request,response;
      try{
        return await $fetch(...args);
      }catch(e){
        console.warn(e,...arguments);
        return new Response(Object.getOwnPropertyNames(e??{}).map(x=>`${x} : ${e[x]}`).join(''),{
          status : 569,
          statusText:e?.message
        });
      }
    },$fetch);
})();
