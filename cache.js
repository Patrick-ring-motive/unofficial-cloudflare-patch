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
  const $matchAll = Cache.prototype.matchAll;
  Cache.prototype.matchAll = Object.setPrototypeOf(async function matchAll(...args){
    try{
      return await $matchAll.apply(this,args);
    }catch(e){
      console.warn(e,this,...args);
      return [];
    }
  },$matchAll);
})();
