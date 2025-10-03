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
(()=>{
  const $put = Cache.prototype.put;
  Cache.prototype.put = Object.setPrototypeOf(async function put(...args){
    try{
      return await $put.apply(this,args);
    }catch(e){
      console.warn(e,this,...args);
    }
  },$put);
})();
(()=>{
  const _delete = Cache.prototype.delete;
  Cache.prototype.delete = Object.setPrototypeOf(async function $delete(...args){
    try{
      return await _delete.apply(this,args);
    }catch(e){
      console.warn(e,this,...args);
      return false
    }
  },_delete);
})();
(()=>{
  const $keys = Cache.prototype.keys;
  Cache.prototype.keys = Object.setPrototypeOf(async function keys(...args){
    try{
      return await $keys.apply(this,args);
    }catch(e){
      console.warn(e,this,...args);
      return [];
    }
  },$keys);
})();
