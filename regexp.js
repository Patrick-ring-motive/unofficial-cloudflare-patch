(()=>{
  const _RegExp = globalThis.RegExp;
  globalThis.RegExp = class RegExp extends _RegExp{
    constructor(...args){
      try{
        return super(...args);
      }catch(e){
        console.warn(e,...args);
        return super(/$a^/);
      }
    }
  };
})();
