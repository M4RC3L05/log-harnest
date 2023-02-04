import config from "../config.js";
import { requester } from "../utils/request.js";

/**
 * @param { AbortSignal } signal
 * @param { Object } args
 * @param { string } [args.name]
 * @param { Date } [args.from]
 * @param { Date } [args.to]
 * @param { string } [args.level]
 * @param { string } [args.message]
 */
export const getLogs = async (signal, { name, from, to, message, level }) => {
  const url = new URL(`${config.api.url}/api/logs`);

  if (name) url.searchParams.set("name", name);
  if (from) url.searchParams.set("from", from.toISOString());
  if (message) url.searchParams.set("message", message);
  if (level) url.searchParams.set("level", level);
  url.searchParams.set("to", to ? to.toISOString() : new Date().toISOString());
  const { data: logs } = await requester(url.toString(), { signal });

  return logs;
};

/**
 * @param { AbortSignal } signal
 */
export const getIndexedSources = async (signal) => {
  const url = new URL(`${config.api.url}/api/logs/names`);

  const { data: names } = await requester(url.toString(), { signal });

  return names;
};
