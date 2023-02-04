import config from "../config.js";

/**
 * @param {string} url
 * @param {RequestInit | undefined} options
 */
export const requester = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      authorization: "Basic " + globalThis.btoa(`${config.basicAuth.username}:${config.basicAuth.password}`),
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Error requesting", {
        cause: { ok: response.ok, status: response.status, statusText: response.statusText, url: response.url },
      });
    }

    return response.json();
  });
};
