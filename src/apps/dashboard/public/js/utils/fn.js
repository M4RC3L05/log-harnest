/**
 * @param { Function } fn
 * @param { number } ms
 */
export const debounce = (fn, ms) => {
  let /** @type { any } */ timeout;

  return (/** @type {any[]} */ ...args) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = globalThis.setTimeout(() => fn(...args), ms);
  };
};
