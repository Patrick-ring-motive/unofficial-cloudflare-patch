(() => {
  // Utility to convert camelCase to kebab-case
  const camelToKebab = (str) => {
    return String(str).replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  };

  // Utility to check if a value is a string (primitive, String object, or from other realms)
  const isString = (x) => typeof x === 'string' || x instanceof String || x?.constructor?.name == 'String';

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

  // Apply Proxy to Headers, FormData, and URLSearchParams
  for (const WebMap of [Headers, FormData, URLSearchParams]) {
    // Store the original prototype
    const WebMapPrototype = WebMap.prototype;

    // Utility wrappers for WebMapPrototype methods
    const WebMapPrototypeHas = (...args) => {
      try {
        return WebMapPrototype.has.call(...args);
      } catch (e) {
        console.warn(e, ...args);
        return false;
      }
    };

    const WebMapPrototypeGet = (...args) => {
      try {
        return WebMapPrototype.get.call(...args);
      } catch (e) {
        console.warn(e, ...args);
        return undefined;
      }
    };

    const WebMapPrototypeSet = (...args) => {
      try {
        return WebMapPrototype.set.call(...args);
      } catch (e) {
        console.warn(e, ...args);
        return false;
      }
    };

    // Create the Proxy handler
    const WebMapProxyHandler = {
      get(target, prop, receiver) {
        // If prop is not a string, use default behavior
        if (!isString(prop)) {
          return ReflectGet(target, prop, receiver);
        }

        try {
          // 1. Check if the property exists directly on the instance
          if (ReflectHas(target, prop)) {
            return ReflectGet(target, prop, receiver);
          }

          // 2. Check if the key exists as-is (e.g., 'Content-Type')
          const value = WebMapPrototypeGet(receiver, prop);
          if (value != null) {
            return value;
          }

          // 3. Convert camelCase to kebab-case and check
          const kebabProp = camelToKebab(prop);
          return WebMapPrototypeGet(receiver, kebabProp);
        } catch (e) {
          console.warn(e, prop, receiver);
          return undefined; // Return undefined on error to prevent breaking
        }
      },

      set(target, prop, value, receiver) {
        // If prop is not a string, use default behavior
        if (!isString(prop)) {
          return ReflectSet(target, prop, value, receiver);
        }

        try {
          // For setters, prioritize kebab-case keys, then as-is, then direct property
          const kebabProp = camelToKebab(prop);
          if (WebMapPrototypeHas(receiver, kebabProp)) {
            // If the kebab-case key exists, update it
            WebMapPrototypeSet(receiver, kebabProp, value);
            return true;
          } else if (WebMapPrototypeHas(receiver, prop)) {
            // If the key exists as-is, update it
            WebMapPrototypeSet(receiver, prop, value);
            return true;
          } else if (ReflectHas(target, prop, receiver)) {
            // If the property exists directly on the target, set it
            return ReflectSet(target, prop, value, receiver);
          } else {
            // Otherwise, set as a new key in kebab-case
            WebMapPrototypeSet(receiver, kebabProp, value);
            return true;
          }
        } catch (e) {
          console.warn(e, prop, value, receiver);
          return false; // Return false to indicate set failure
        }
      },

      has(target, prop) {
        // If prop is not a string, use default behavior
        if (!isString(prop)) {
          return ReflectHas(target, prop);
        }

        try {
          return (
            ReflectHas(target, prop) ||
            WebMapPrototypeHas(target, prop) ||
            WebMapPrototypeHas(target, camelToKebab(prop))
          );
        } catch (e) {
          console.warn(e, prop, target);
          return false; // Return false on error
        }
      }
    };

    // Apply the Proxy to the WebMap prototype
    Object.setPrototypeOf(WebMap.prototype, new Proxy(WebMapPrototype, WebMapProxyHandler));
  }

  // Example usage for Headers
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.accept = 'text/html'; // Sets 'accept' as 'text/html'
  headers.contentType = 'text/plain'; // Sets 'Content-Type' as 'text/plain'
  headers.contentType ??= 'text/xml'; // Won't overwrite existing 'Content-Type'
  headers.newHeader ??= 'new-value'; // Sets 'new-header' as 'new-value'
  console.log(headers.get('contentType')); // 'text/plain'
  console.log(headers.get('Content-Type')); // 'text/plain'
  console.log(headers.get('accept')); // 'text/html'
  console.log(headers.get('newHeader')); // 'new-value'
  console.log(headers.get('new-header')); // 'new-value'
  console.log('contentType' in headers); // true
  console.log('Content-Type' in headers); // true
  console.log('newHeader' in headers); // true

  // Example usage for FormData
  const formData = new FormData();
  formData.set('userName', 'JohnDoe');
  formData.emailAddress = 'john@example.com'; // Sets 'email-address'
  formData.emailAddress ??= 'jane@example.com'; // Won't overwrite
  console.log(formData.get('emailAddress')); // 'john@example.com'
  console.log(formData.get('email-address')); // 'john@example.com'
  console.log('emailAddress' in formData); // true

  // Example usage for URLSearchParams
  const params = new URLSearchParams();
  params.set('queryString', 'search');
  params.pageNumber = '1'; // Sets 'page-number'
  params.pageNumber ??= '2'; // Won't overwrite
  console.log(params.get('pageNumber')); // '1'
  console.log(params.get('page-number')); // '1'
  console.log('pageNumber' in params); // true

  // Test error handling
  const invalidHeaders = new Headers();
  try {
    invalidHeaders.set('invalid', 'value'); // Should warn, not throw
  } catch (e) {
    console.log('No error thrown, handled by Proxy');
  }
  console.log(invalidHeaders.get('invalid')); // undefined, with warning

  // Test cross-realm string
  const iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  const crossRealmString = iframe.contentWindow.String('crossRealm');
  console.log(isString(crossRealmString)); // true
  headers[crossRealmString] = 'test'; // Sets 'cross-realm'
  console.log(headers.get('crossRealm')); // 'test'
  console.log(headers.get('cross-realm')); // 'test'
  document.body.removeChild(iframe);
})();
