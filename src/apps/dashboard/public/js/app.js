/* eslint-disable n/file-extension-in-import */
import { html } from "htm/preact";
import { render } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { chromeDark, ObjectInspector } from "react-inspector";

import * as logUtils from "./utils/log.js";

/**
 * @param { Object } args
 * @param { string } [args.name]
 * @param { Date } [args.from]
 * @param { Date } [args.to]
 * @param { AbortSignal } signal
 */
const getLogs = async ({ name, from, to }, signal) => {
  const url = new URL("http://127.0.0.1:4321/api/logs");

  if (name) url.searchParams.set("name", name);
  if (from) url.searchParams.set("from", new Date(from).toISOString());
  url.searchParams.set("to", to ? new Date(to).toISOString() : new Date().toISOString());

  const { data: logs } = await fetch(url.toString(), { signal }).then((response) => response.json());

  return logs;
};

/**
 * @param { AbortSignal } signal
 */
const getIndexedSources = async (signal) => {
  const url = new URL("http://127.0.0.1:4321/api/logs/names");

  const { data: names } = await fetch(url.toString(), { signal }).then((response) => response.json());

  return names;
};

/**
 * @param { Object } args
 * @param { string } [args.name]
 * @param { Date } [args.from]
 * @param { Date } [args.to]
 * @returns {{ data: Record<string, any>[] | undefined, error: Error | undefined, requesting: boolean }}
 */
const useGetLogs = ({ name, from, to } = {}) => {
  const [data, setData] = useState(undefined);
  const [requesting, setRequesting] = useState(true);
  const [error, setError] = useState(undefined);
  const abortCtrl = useRef(new AbortController());

  useEffect(() => {
    if (!abortCtrl.current) {
      abortCtrl.current = new AbortController();
    }

    setData(undefined);
    setError(undefined);
    setRequesting(true);

    getLogs({ name, from, to }, abortCtrl.current.signal)
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => {
        setRequesting(false);
      });

    return () => {
      if (abortCtrl.current) {
        abortCtrl.current.abort();
      }

      // @ts-ignore
      abortCtrl.current = undefined;
    };
  }, [name, from, to]);

  return { data, error, requesting };
};

/**
 * @returns {{ data: Record<string, string>[] | undefined, error: Error | undefined, requesting: boolean }}
 */
const useGetIndexedSources = () => {
  const [data, setData] = useState(undefined);
  const [requesting, setRequesting] = useState(true);
  const [error, setError] = useState(undefined);
  const abortCtrl = useRef(new AbortController());

  useEffect(() => {
    if (!abortCtrl.current) {
      abortCtrl.current = new AbortController();
    }

    setData(undefined);
    setError(undefined);
    setRequesting(true);

    getIndexedSources(abortCtrl.current.signal)
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => {
        setRequesting(false);
      });

    return () => {
      if (abortCtrl.current) {
        abortCtrl.current.abort();
      }

      // @ts-ignore
      abortCtrl.current = undefined;
    };
  }, []);

  return { data, error, requesting };
};

/**
 * @param {{ name: string, level: string, timestamp: Date, data: string }} args
 */
const LogItem = ({ name, level, timestamp, data }) => {
  return html`
    <div style=${{ paddingTop: "5px", paddingBottom: "5px" }}>
      <div
        style=${{
          height: "auto",
          lineHeight: "20px",
          fontSize: "12px",
          overflow: "hidden",
          display: "flex",
        }}
      >
        <div style=${{ color: logUtils.levelColor(level), marginRight: "10px", width: "55px" }}>
          ${logUtils.levelEmoji(level)} ${level}
        </div>
        <div style=${{ marginRight: "15px", width: "132px" }}>${new Date(timestamp).toLocaleString()}</div>
        <div style=${{ marginRight: "15px" }}>${name}</div>
        <div style=${{ flex: 1, display: "flex", alignItems: "center" }}>
          <${ObjectInspector}
            expandLevel=${0}
            theme=${{ ...chromeDark, BASE_BACKGROUND_COLOR: "#222" }}
            data=${JSON.parse(data)}
          />
        </div>
      </div>
    </div>
  `;
};

/**
 * @param {{name: string, from: Date, to: Date}} args
 */
const Logs = ({ name, from, to }) => {
  const { data, error, requesting } = useGetLogs({ name, from, to });

  if (requesting) {
    return html`
      <div>
        <p>Loading logs...</p>
      </div>
    `;
  }

  if (error) {
    return html`
      <div>
        <p>Error requesting logs</p>
        <pre>${JSON.stringify(error, null, 2)}</pre>
      </div>
    `;
  }

  if (!Array.isArray(data)) {
    throw new TypeError("Data is in a invalid shape", { cause: data });
  }

  if (data.length <= 0) {
    return html`
      <div>
        <p>No logs to show</p>
      </div>
    `;
  }

  return html`
    <div style=${{ wordWrap: "anywhere" }}>
      ${data.map(
        (/** @type {any} */ log, /** @type {number} */ index) =>
          html`
            <div style=${{ borderBottom: index === data.length - 1 ? undefined : "1px solid #ccc" }}>
              <${LogItem} ...${log} />
            </div>
          `,
      )}
    </div>
  `;
};

/**
 * @param {{ setName: (arg: any) => void, setFrom: (arg: any) => void, setTo: (arg: any) => void }} args
 */
const LogFilters = ({ setName, setFrom, setTo }) => {
  const { data, requesting } = useGetIndexedSources();

  return html`
    <div style=${{ display: "flex", justifyContent: "center" }}>
      <select
        disabled=${requesting}
        onInput=${(/** @type {{ target: { value: any; }; }} */ event) => setName(event.target.value)}
      >
        <option name=""></option>
        ${Array.isArray(data) && data.length > 0
          ? data.map(({ name }) => html`<option value=${name}>${name}</option>`)
          : html``}
      </select>
      <div style=${{ display: "flex", flexDirection: "column" }}>
        <input
          type="datetime-local"
          onChange=${(/** @type {{ target: { value: string; }; }} */ event) =>
            // @ts-ignore
            setFrom(event.target.value && event.target.value.length > 0 ? new Date(event.target.value) : undefined)}
        />
        <input
          type="datetime-local"
          onChange=${(/** @type {{ target: { value: string; }; }} */ event) =>
            // @ts-ignore
            setTo(event.target.value && event.target.value.length > 0 ? new Date(event.target.value) : undefined)}
        />
      </div>
    </div>
  `;
};

const App = () => {
  const [name, setName] = useState(undefined);
  const [from, setFrom] = useState(undefined);
  const [to, setTo] = useState(undefined);

  return html`
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-10 offset-lg-1">
          <${LogFilters} setName=${setName} setFrom=${setFrom} setTo=${setTo} />
        </div>
      </div>

      <div class="row">
        <div class="col-lg-10 offset-lg-1 mb-4">
          <${Logs} name=${name} from=${from} to=${to} />
        </div>
      </div>
    </div>
  `;
};

// @ts-ignore
render(html`<${App} />`, globalThis.document.querySelector("#app"));
