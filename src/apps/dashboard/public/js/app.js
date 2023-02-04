/* eslint-disable n/file-extension-in-import */

import { html } from "htm/preact";
import { render } from "preact";
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { chromeDark, ObjectInspector } from "react-inspector";
import { serializeError } from "serialize-error";

import { useGetIndexedSources, useGetLogs } from "./hooks/mod.js";
import { debounce } from "./utils/fn.js";
import { levelColor, levelEmoji, levelIndexes } from "./utils/log.js";

/**
 * @param {{ data: Record<string, any> }} args
 */
const LogInspector = ({ data }) => {
  return html`
    <${ObjectInspector} expandLevel=${0} theme=${{ ...chromeDark, BASE_BACKGROUND_COLOR: "#222" }} data=${data} />
  `;
};

/**
 * @param {{ name: string, level: string, message: string, timestamp: Date, data: string }} args
 */
const LogItem = ({ name, level, message, timestamp, data }) => {
  const [collapsed, setCollapsed] = useState(true);

  return html`
    <div style=${{ paddingTop: "5px", paddingBottom: "5px" }}>
      <div
        style=${{
          height: "auto",
          lineHeight: "20px",
          fontSize: "12px",
          overflow: "hidden",
          display: "flex",
          whiteSpace: "nowrap",
          cursor: "pointer",
        }}
        onClick=${() => setCollapsed((value) => !value)}
      >
        <div style=${{ marginRight: "5px" }}>${collapsed ? "▸" : "▾"}</div>
        <div style=${{ color: levelColor(level), marginRight: "10px", width: "55px" }}>
          ${levelEmoji(level)} ${level}
        </div>
        <div style=${{ marginRight: "15px" }}>${new Date(timestamp).toLocaleString()}</div>
        <div style=${{ marginRight: "15px" }}>${name}</div>
        <div
          style=${{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          ${message}
        </div>
      </div>
      <div style=${{ wordWrap: "anywhere" }}>
        ${collapsed ? undefined : html`<${LogInspector} data=${JSON.parse(data)} />`}
      </div>
    </div>
  `;
};

/**
 * @param { Object } args
 * @param { string } args.name
 * @param { Date } args.from
 * @param { Date } args.to
 * @param { string } args.message
 * @param { string } args.level
 * @param { boolean } args.refreshLogs
 * @param { (arg: boolean) => void } args.setRefreshLogs
 */
const Logs = ({ name, from, to, message, level, refreshLogs, setRefreshLogs }) => {
  const { data, error, requesting, refetch, cancel } = useGetLogs({ name, from, to, message, level });

  useEffect(() => {
    if (refreshLogs) {
      setRefreshLogs(false);
      cancel();
      refetch();
    }
  }, [refreshLogs]);

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
        <pre>${JSON.stringify(serializeError(error), undefined, 2)}</pre>
      </div>
    `;
  }

  if (!Array.isArray(data) || data.length <= 0) {
    return html`
      <div>
        <p>No logs to show</p>
      </div>
    `;
  }

  return html`
    <div>
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
 * @param { Object } args
 * @param { (arg: string) => void } args.setName
 * @param { (arg: Date) => void } args.setFrom
 * @param { (arg: Date) => void } args.setTo
 * @param { (arg: string) => void } args.setMessage
 * @param { (arg: string) => void } args.setLevel
 * @param { (arg: boolean) => boolean } args.setRefreshLogs
 */
const LogFilters = ({ setName, setFrom, setTo, setMessage, setLevel, setRefreshLogs }) => {
  const { data, requesting } = useGetIndexedSources();
  const debouncedSetMessage = useMemo(() => debounce(setMessage, 250), [setMessage]);

  return html`
    <div class="row g-3 pt-5 pb-5 text-center">
      <div class="col-12">
        <input
          type="text"
          class="form-control form-select-sm"
          placeholder="Search message.."
          onInput=${(/** @type {{ target: { value: any; }; }} */ event) => debouncedSetMessage(event.target.value)}
        />
      </div>
      <div class="col">
        <select
          class="form-select form-select-sm"
          disabled=${requesting}
          onInput=${(/** @type {{ target: { value: any; }; }} */ event) => setName(event.target.value)}
        >
          <option value="" disabled selected hidden>Name</option>
          <option value="">-</option>
          ${Array.isArray(data) && data.length > 0
            ? data.map(({ name }) => html`<option value=${name}>${name}</option>`)
            : undefined}
        </select>
      </div>
      <div class="col">
        <select
          class="form-select form-select-sm"
          onInput=${(/** @type {{ target: { value: any; }; }} */ event) => setLevel(event.target.value)}
        >
          <option value="" disabled selected hidden>Level</option>
          <option value="">-</option>
          ${Object.entries(levelIndexes).map(([key, value]) => html`<option value=${key}>${value}</option>`)}
        </select>
      </div>
      <div class="col">
        <input
          type="datetime-local"
          class="form-control form-control-sm"
          onChange=${(/** @type {{ target: { value: string; }; }} */ event) =>
            // @ts-ignore
            setFrom(event.target.value && event.target.value.length > 0 ? new Date(event.target.value) : undefined)}
        />
      </div>
      <div class="col">
        <input
          type="datetime-local"
          class="form-control form-control-sm"
          onChange=${(/** @type {{ target: { value: string; }; }} */ event) =>
            // @ts-ignore
            setTo(event.target.value && event.target.value.length > 0 ? new Date(event.target.value) : undefined)}
        />
      </div>
      <div class="col d-grid">
        <button class="btn btn-primary btn-sm" onClick=${() => setRefreshLogs(true)}>
          <i class="bi bi-arrow-clockwise"></i>
        </button>
      </div>
    </div>
  `;
};

const App = () => {
  const [name, setName] = useState(undefined);
  const [level, setLevel] = useState(undefined);
  const [message, setMessage] = useState(undefined);
  const [from, setFrom] = useState(undefined);
  const [to, setTo] = useState(undefined);
  const [refreshLogs, setRefreshLogs] = useState(false);
  const [hasScroll, setHasScroll] = useState(false);
  const appRef = useRef(globalThis.document.querySelector("#app"));

  const checkAppScroll = useCallback(() => {
    if (!appRef.current) {
      setHasScroll(false);

      return;
    }

    if (appRef.current.scrollTop > 10) {
      setHasScroll(true);
    } else {
      setHasScroll(false);
    }
  }, []);

  useEffect(() => {
    if (appRef.current) {
      checkAppScroll();

      appRef.current.addEventListener("scroll", checkAppScroll);

      return () => {
        appRef.current?.removeEventListener("scroll", checkAppScroll);
      };
    }
  }, []);

  return html`
    <div class="container-fluid">
      <div
        class="row position-fixed top-0 end-0 start-0"
        style=${{
          background: "#222",
          boxShadow: hasScroll ? "0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)" : undefined,
          transition: "box-shadow .3s ease-in-out",
        }}
      >
        <div class="col-lg-10 offset-lg-1">
          <${LogFilters}
            setName=${setName}
            setFrom=${setFrom}
            setTo=${setTo}
            setMessage=${setMessage}
            setLevel=${setLevel}
            setRefreshLogs=${setRefreshLogs}
          />
        </div>
      </div>

      <div class="row" style=${{ marginTop: "184px", fontFamily: "monospace", fontSize: ".8em" }}>
        <div class="col-lg-10 offset-lg-1 mb-4">
          <${Logs}
            name=${name}
            from=${from}
            to=${to}
            message=${message}
            level=${level}
            refreshLogs=${refreshLogs}
            setRefreshLogs=${setRefreshLogs}
          />
        </div>
      </div>
    </div>
  `;
};

// @ts-ignore
render(html`<${App} />`, globalThis.document.querySelector("#app"));
