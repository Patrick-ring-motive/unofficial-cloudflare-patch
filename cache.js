(()=>{
  const $match = Cache.prototype.match;
  Cache.prototype.match = Object.setPrototypeOf(async function match(...args){
    try{
      return await $match.apply(this,args);
    }catch(e){
      console.warn(e,this,...args);
    }
  },$match);
})();
(()=>{
  const $match = Cache.prototype.match;
  Cache.prototype.match = Object.setPrototypeOf(async function match(...args){
    try{
      return await $match.apply(this,args);
    }catch(e){
      console.warn(e,this,...args);
    }
  },$match);
})();
