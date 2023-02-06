import config from "../config.js";

export const requester = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      authorization: "Basic " + globalThis.btoa(`${config.basicAuth.username}:${config.basicAuth.password}`),
    },
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error("Error requesting", {
        cause: {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          body: await response.json(),
        },
      });
    }

    return response.json();
  });
};
