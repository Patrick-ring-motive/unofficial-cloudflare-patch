(()=>{
  // Utility to convert camelCase to kebab-case
function camelToKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
  
const ReflectHas = (...args)=>{
  try{
    return Reflect.has(...args);
  }catch(e){
    console.warn(e,...args);
  }
};

const ReflectGet = (...args)=>{
  try{
    return Reflect.get(...args);
  }catch(e){
    console.warn(e,...args);
  }
};

const ReflectSet = (...args)=>{
  try{
    return Reflect.Set(...args);
  }catch(e){
    console.warn(e,...args);
  }
};
  
// Store the original Headers prototype
const HeadersPrototype = Headers.prototype;

const HeadersPrototypeHas = (...args)=>{
  try{
    return HeadersPrototype.has(...args);
  }catch(e){
    console.warn(e,...args);
  }
};

const HeadersPrototypeGet = (...args)=>{
  try{
    return HeadersPrototype.get(...args);
  }catch(e){
    console.warn(e,...args);
  }
};

const HeadersPrototypeSet = (...args)=>{
  try{
    return HeadersPrototype.set(...args);
  }catch(e){
    console.warn(e,...args);
  }
};
  
// Create the Proxy handler
const headersProxyHandler = {
  get(target, prop, receiver) {

    try {
      // 1. Check if the property exists directly on the Headers instance
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }

      // 2. Check if the header exists as-is (e.g., 'Content-Type')
      const value = HeadersPrototype.get.call(receiver, prop);
      if (value !== null) {
        return value;
      }

      // 3. Convert camelCase to kebab-case and check headers
      const kebabProp = camelToKebab(prop);
      return HeadersPrototype.get.call(receiver, kebabProp);
    } catch (e) {
      console.warn(e, prop, receiver);
      return undefined; // Return undefined on error to prevent breaking
    }
  },

  set(target, prop, value, receiver) {
    try {
      // For setters, prioritize kebab-case headers, then direct property
      const kebabProp = camelToKebab(prop);
      if (HeadersPrototype.has.call(receiver, kebabProp)) {
        // If the kebab-case header exists, update it
        HeadersPrototype.set.call(receiver, kebabProp, value);
        return true;
      } else if (HeadersPrototype.has.call(receiver, prop)) {
        // If the header exists as-is, update it
        HeadersPrototype.set.call(receiver, prop, value);
        return true;
      } else if(Reflect.has(target, prop, receiver)){
        return Reflect.set(target, prop, value, receiver);
      } else {
        // Otherwise, set as a new header in kebab-case
        HeadersPrototype.set.call(receiver, kebabProp, value);
        return true;
      }
    } catch (e) {
      console.warn(e, prop, value, receiver);
      return false; // Return false to indicate set failure
    }
  },

  
};

// Apply the Proxy to Headers.prototype
Object.setPrototypeOf(Headers.prototype, new Proxy(OriginalHeaders, headersProxyHandler));

// Example usage:
const headers = new Headers();

// Set headers using different formats
headers.set('Content-Type', 'application/json');
headers.accept = 'text/html'; // Sets 'accept' as 'text/html'
headers.contentType = 'text/plain'; // Sets 'Content-Type' as 'text/plain'

// Use ??= to set a default if not present
headers.contentType ??= 'text/xml'; // Won't overwrite existing 'Content-Type'
headers.newHeader ??= 'new-value'; // Sets 'new-header' as 'new-value'

// Test getters
console.log(headers.get('contentType')); // 'text/plain'
console.log(headers.get('Content-Type')); // 'text/plain'
console.log(headers.get('accept')); // 'text/html'
console.log(headers.get('newHeader')); // 'new-value'
console.log(headers.get('new-header')); // 'new-value'

// Test has
console.log('contentType' in headers); // true
console.log('Content-Type' in headers); // true
console.log('newHeader' in headers); // true

// Test error handling
const invalidHeaders = new Headers();
try {
  // Simulate an error scenario (e.g., invalid header name)
  invalidHeaders.set('invalid', 'value'); // Should warn, not throw
} catch (e) {
  console.log('No error thrown, handled by Proxy');
}
console.log(invalidHeaders.get('invalid')); // undefined, with warning
})();
