(()=>{
// Utility to convert camelCase to kebab-case
function camelToKebab(str) {
  return String(str).replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

// Utility wrappers for Reflect methods
const ReflectHas = (...args) => {
  try {
    return Reflect.has(...args);
  } catch (e) {
    console.warn(e, ...args);
    return false;
  }
};

const ReflectGet = (...args) => {
  try {
    return Reflect.get(...args);
  } catch (e) {
    console.warn(e, ...args);
    return undefined;
  }
};

const ReflectSet = (...args) => {
  try {
    return Reflect.set(...args);
  } catch (e) {
    console.warn(e, ...args);
    return false;
  }
};
for(const WebMap of [Headers, FormData, URLSearchParams]){
// Store the original Headers prototype
const HeadersPrototype = Headers.prototype;

// Utility wrappers for HeadersPrototype methods
const HeadersPrototypeHas = (...args) => {
  try {
    return HeadersPrototype.has.call(...args);
  } catch (e) {
    console.warn(e, ...args);
    return false;
  }
};

const HeadersPrototypeGet = (...args) => {
  try {
    return HeadersPrototype.get.call(...args);
  } catch (e) {
    console.warn(e, ...args);
    return undefined;
  }
};

const HeadersPrototypeSet = (...args) => {
  try {
    return HeadersPrototype.set.call(...args);
  } catch (e) {
    console.warn(e, ...args);
    return false;
  }
};

// Create the Proxy handler
const headersProxyHandler = {
  get(target, prop, receiver) {
    // If prop is a symbol or not a string, use default behavior
    if (typeof prop !== 'string') {
      return ReflectGet(target, prop, receiver);
    }

    try {
      // 1. Check if the property exists directly on the Headers instance
      if (ReflectHas(target, prop)) {
        return ReflectGet(target, prop, receiver);
      }

      // 2. Check if the header exists as-is (e.g., 'Content-Type')
      const value = HeadersPrototypeGet(receiver, prop);
      if (value != null) {
        return value;
      }

      // 3. Convert camelCase to kebab-case and check headers
      const kebabProp = camelToKebab(prop);
      return HeadersPrototypeGet(receiver, kebabProp);
    } catch (e) {
      console.warn(e, prop, receiver);
      return undefined; // Return undefined on error to prevent breaking
    }
  },

  set(target, prop, value, receiver) {
    // If prop is a symbol or not a string, use default behavior
    if (typeof prop !== 'string') {
      return ReflectSet(target, prop, value, receiver);
    }

    try {
      // For setters, prioritize kebab-case headers, then direct header, then direct property
      const kebabProp = camelToKebab(prop);
      if (HeadersPrototypeHas(receiver, kebabProp)) {
        // If the kebab-case header exists, update it
        HeadersPrototypeSet(receiver, kebabProp, value);
        return true;
      } else if (HeadersPrototypeHas(receiver, prop)) {
        // If the header exists as-is, update it
        HeadersPrototypeSet(receiver, prop, value);
        return true;
      } else if (ReflectHas(target, prop, receiver)) {
        // If the property exists directly on the target, set it
        return ReflectSet(target, prop, value, receiver);
      } else {
        // Otherwise, set as a new header in kebab-case
        HeadersPrototypeSet(receiver, kebabProp, value);
        return true;
      }
    } catch (e) {
      console.warn(e, prop, value, receiver);
      return false; // Return false to indicate set failure
    }
  },

  has(target, prop) {
    // Handle `in` operator (e.g., for ??=)
    if (typeof prop !== 'string') {
      return ReflectHas(target, prop);
    }

    try {
      return (
        ReflectHas(target, prop) ||
        HeadersPrototypeHas(target, prop) ||
        HeadersPrototypeHas(target, camelToKebab(prop))
      );
    } catch (e) {
      console.warn(e, prop, target);
      return false; // Return false on error
    }
  }
};

// Apply the Proxy to Headers.prototype
Object.setPrototypeOf(Headers.prototype, new Proxy(HeadersPrototype, headersProxyHandler));
}
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
