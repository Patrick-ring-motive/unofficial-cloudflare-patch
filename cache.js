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
(()=>{
  const $add = Cache.prototype.add;
  Cache.prototype.add = Object.setPrototypeOf(async function add(...args){
    try{
      return await $add.apply(this,args);
    }catch(e){
      console.warn(e,this,...args);
    }
  },$add);
})();
(()=>{
  const $addAll = Cache.prototype.addAll;
  Cache.prototype.addAll = Object.setPrototypeOf(async function addAll(...args){
    try{
      return await $addAll.apply(this,args);
    }catch(e){
      console.warn(e,this,...args);
    }
  },$addAll);
})();
