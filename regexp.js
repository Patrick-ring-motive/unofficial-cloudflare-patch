(()=>{
  const _RegExp = globalThis.RegExp;
  globalThis.RegExp = class RegExp extends _RegExp{
    constructor(...args){
      try{
        super(...args);
      }catch(e){
        super(/$a^/);
        console.warn(e,...args);
      }
    }
  };
})();
