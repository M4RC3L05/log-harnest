export const debounce = (fn, ms) => {
  let timeout;

  return (...args) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = globalThis.setTimeout(() => fn(...args), ms);
  };
};
