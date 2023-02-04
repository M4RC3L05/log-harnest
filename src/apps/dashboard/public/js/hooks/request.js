/* eslint-disable n/file-extension-in-import */

import { useCallback, useEffect, useRef, useState } from "preact/hooks";

import { logsApi } from "../api/mod.js";

/**
 * @param { (signal: AbortSignal, args: any) => Promise<any> } requestFn
 * @param { Record<string, unknown> | undefined } [args]
 */
export const useRequest = (requestFn, args) => {
  const [data, setData] = useState(undefined);
  const [requesting, setRequesting] = useState(true);
  const [error, setError] = useState(undefined);
  const abortCtrl = useRef(new AbortController());

  const refetch = useCallback(() => request(), []);
  const cancel = useCallback(() => {
    if (abortCtrl.current) {
      abortCtrl.current.abort();
    }

    // @ts-ignore
    abortCtrl.current = undefined;
  }, []);

  const request = async () => {
    if (!abortCtrl.current) {
      abortCtrl.current = new AbortController();
    }

    return requestFn(abortCtrl.current.signal, args)
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        if (error instanceof DOMException) {
          return;
        }

        setError(error);
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  useEffect(() => {
    setData(undefined);
    setError(undefined);
    setRequesting(true);

    request();

    return () => {
      cancel();
    };
  }, [JSON.stringify(args)]);

  return { data, requesting, error, refetch, cancel };
};

/**
 * @param { Object } args
 * @param { string } [args.name]
 * @param { Date } [args.from]
 * @param { Date } [args.to]
 * @param { string } [args.level]
 * @param { string } [args.message]
 * @returns {{ data: Record<string, any>[] | undefined, error: Error | undefined, requesting: boolean, refetch: () => void, cancel: () => void }}
 */
export const useGetLogs = ({ name, from, to, level, message } = {}) => {
  return useRequest(logsApi.getLogs, { name, from, to, level, message });
};

/**
 * @returns {{ data: Record<string, string>[] | undefined, error: Error | undefined, requesting: boolean }}
 */
export const useGetIndexedSources = () => {
  return useRequest(logsApi.getIndexedSources);
};
