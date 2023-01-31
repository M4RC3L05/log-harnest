/**
 * @param  {...AbortSignal} abortSignals
 */
export const any = (...abortSignals) => {
  const aggregatedAbortController = new AbortController();

  const onAbort = () => {
    for (const signal of abortSignals) signal.removeEventListener("abort", onAbort);

    aggregatedAbortController.abort();
  };

  for (const signal of abortSignals) signal.addEventListener("abort", onAbort);

  return aggregatedAbortController;
};
