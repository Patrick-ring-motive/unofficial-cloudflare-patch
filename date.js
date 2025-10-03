(()=>{
  let now;
  const $Date = globalThis.Date;
  globalThis.Date = class Date extends $Date{
    constructor(...args){
      if(!now){
        now = new $Date().getTime();
        setInterval(()=>now++,1);
      }
      if(!args?.length){
        return super(now);
      }
      return super(...args);
    }
  }
})();
