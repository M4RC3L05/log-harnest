/* eslint-disable n/file-extension-in-import */

import { useCallback, useEffect, useRef, useState } from "preact/hooks";

import { logsApi } from "../api/mod.js";

export const useRequest = (requestFn, args) => {
  const [data, setData] = useState(undefined);
  const [requesting, setRequesting] = useState(true);
  const [error, setError] = useState(undefined);
  const abortCtrl = useRef(new AbortController());

  const request = useCallback(async () => {
    if (!abortCtrl.current) {
      abortCtrl.current = new AbortController();
    }

    setRequesting(true);
    setData(undefined);
    setError(undefined);

    return requestFn(abortCtrl.current.signal, args)
      .then((data) => setData(data))
      .catch((error) => {
        // Ignore abort signal error
        if (error instanceof DOMException) {
          return;
        }

        setError(error);
      })
      .finally(() => setRequesting(false));
  }, [requestFn, JSON.stringify(args)]);
  const refetch = useCallback(() => request(), [request]);
  const cancel = useCallback(() => {
    if (abortCtrl.current) {
      abortCtrl.current.abort();
    }

    abortCtrl.current = undefined;
  }, []);

  useEffect(() => {
    request();

    return () => {
      cancel();
    };
  }, [JSON.stringify(args)]);

  return { data, requesting, error, refetch, cancel };
};

export const useGetLogs = ({ name, from, to, level, message } = {}) => {
  return useRequest(logsApi.getLogs, { name, from, to, level, message });
};

export const useGetIndexedSources = () => {
  return useRequest(logsApi.getIndexedSources);
};
