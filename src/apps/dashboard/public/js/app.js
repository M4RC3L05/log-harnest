/* eslint-disable n/file-extension-in-import */

import { ObjectInspector, chromeDark } from "react-inspector";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import { html } from "htm/preact";
import { render } from "preact";
import { serializeError } from "serialize-error";

import { levelColor, levelEmoji, levelIndexes } from "./utils/log.js";
import { useGetIndexedSources, useGetLogs } from "./hooks/mod.js";
import { debounce } from "./utils/fn.js";

const LogInspector = ({ data }) => {
  return html`
    <${ObjectInspector}
      expandLevel=${0}
      theme=${{ ...chromeDark, BASE_BACKGROUND_COLOR: "var(--bs-body-bg)" }}
      data=${data}
    />
  `;
};

const LogItem = ({ name, level, message, timestamp, data }) => {
  const [collapsed, setCollapsed] = useState(true);

  return html`
    <div style=${{ paddingTop: "5px", paddingBottom: "5px", overflowX: "auto" }}>
      <div
        style=${{
          height: "auto",
          lineHeight: "20px",
          fontSize: "12px",
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
        (log, index) =>
          html`
            <div
              key=${`${log.level}||${log.name}||${log.timestamp}||${log.data}`}
              style=${{
                borderBottom: index === data.length - 1 ? undefined : "1px solid var(--bs-border-color-translucent)",
              }}
            >
              <${LogItem} ...${log} />
            </div>
          `,
      )}
    </div>
  `;
};

const LogFilters = ({
  setName,
  name,
  setFrom,
  from,
  setTo,
  to,
  setMessage,
  message,
  setLevel,
  level,
  setRefreshLogs,
}) => {
  const { data, requesting } = useGetIndexedSources();
  const debouncedSetMessage = useMemo(() => debounce(setMessage, 250), [setMessage]);

  return html`
    <div class="row g-3 pt-4 pb-4 text-center">
      <div class="col-12">
        <div class="input-group">
          <input
            defaultValue=${message}
            type="text"
            class="form-control form-select-sm"
            placeholder="Search message.."
            onInput=${(event) => debouncedSetMessage(event.target.value)}
          />
          <button class="btn btn-danger btn-sm" type="button" onClick=${() => setMessage(undefined)}>
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>
      <div class="col-lg col-md-6 col-sm-6 col-xs-6">
        <div class="input-group">
          <select
            defaultValue=${name}
            class="form-select form-select-sm"
            disabled=${requesting}
            onInput=${(event) => setName(event.target.value)}
          >
            <option value="" disabled selected hidden>Name</option>
            <option value="">-</option>
            ${Array.isArray(data) && data.length > 0
              ? data.map(({ name }) => html`<option value=${name}>${name}</option>`)
              : undefined}
          </select>
          <button class="btn btn-danger btn-sm" type="button" onClick=${() => setName(undefined)}>
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>
      <div class="col-lg col-md-6 col-sm-6 col-xs-6">
        <div class="input-group">
          <select
            class="form-select form-select-sm"
            defaultValue=${level}
            onInput=${(event) => setLevel(event.target.value)}
          >
            <option value="" disabled selected hidden>Level</option>
            <option value="">-</option>
            ${Object.entries(levelIndexes).map(([key, value]) => html`<option value=${key}>${value}</option>`)}
          </select>
          <button class="btn btn-danger btn-sm" type="button" onClick=${() => setLevel(undefined)}>
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>
      <div class="col-lg col-md-6 col-sm-6 col-xs-6">
        <div class="input-group">
          <input
            type="datetime-local"
            class="form-control form-control-sm"
            step="1"
            defaultValue=${from?.toISOString()?.replace(/\.\d+Z$/, "")}
            onChange=${(event) => {
              setFrom(event.target.value && event.target.value.length > 0 ? new Date(event.target.value) : undefined);
            }}
          />
          <button class="btn btn-danger btn-sm" type="button" onClick=${() => setFrom(undefined)}>
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>
      <div class="col-lg col-md-6 col-sm-6 col-xs-6">
        <div class="input-group">
          <input
            type="datetime-local"
            class="form-control form-control-sm"
            step="1"
            defaultValue=${to?.toISOString()?.replace(/\.\d+Z$/, "")}
            onChange=${(event) =>
              setTo(event.target.value && event.target.value.length > 0 ? new Date(event.target.value) : undefined)}
          />
          <button class="btn btn-danger btn-sm" type="button" onClick=${() => setTo(undefined)}>
            <i class="bi bi-x"></i>
          </button>
        </div>
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
  const parsedUrl = new URL(globalThis.location.href);
  const [name, setName] = useState(parsedUrl.searchParams.get("name"));
  const [level, setLevel] = useState(parsedUrl.searchParams.get("level"));
  const [message, setMessage] = useState(parsedUrl.searchParams.get("message"));
  const [from, setFrom] = useState(
    parsedUrl.searchParams.has("from") ? new Date(parsedUrl.searchParams.get("from")) : undefined,
  );
  const [to, setTo] = useState(
    parsedUrl.searchParams.has("to") ? new Date(parsedUrl.searchParams.get("to")) : undefined,
  );
  const [refreshLogs, setRefreshLogs] = useState(false);
  const colorModePerfRef = useRef(globalThis.matchMedia("(prefers-color-scheme: dark)"));

  useLayoutEffect(() => {
    const colorMode = colorModePerfRef.current.matches ? "dark" : "light";
    globalThis.document.documentElement.dataset.bsTheme = colorMode;

    const colorModeChange = (event) => {
      globalThis.document.documentElement.dataset.bsTheme = event?.matches ? "dark" : "light";
    };

    colorModePerfRef.current.addEventListener("change", colorModeChange);

    return () => {
      colorModePerfRef.current.removeEventListener("change", colorModeChange);
    };
  }, []);

  useEffect(() => {
    const url = new URL(globalThis.location.href);

    if (name) url.searchParams.set("name", name);
    else url.searchParams.delete("name");
    if (message) url.searchParams.set("message", message);
    else url.searchParams.delete("message");
    if (level) url.searchParams.set("level", level);
    else url.searchParams.delete("level");
    if (from) url.searchParams.set("from", from.toISOString());
    else url.searchParams.delete("from");
    if (to) url.searchParams.set("to", to.toISOString());
    else url.searchParams.delete("to");

    globalThis.history.replaceState(undefined, undefined, url.toString());
  }, [name, level, message, from, to]);

  return html`
    <div class="container-fluid">
      <div
        class="row"
        style=${{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "var(--bs-body-bg)",
          transition: "box-shadow .3s ease-in-out",
          paddingRight: "calc(var(--bs-gutter-x) * .5)",
          paddingLeft: "calc(var(--bs-gutter-x) * .5)",
        }}
      >
        <div class="col-lg-10 offset-lg-1">
          <${LogFilters}
            setName=${setName}
            name=${name}
            setFrom=${setFrom}
            from=${from}
            setTo=${setTo}
            to=${to}
            setMessage=${setMessage}
            message=${message}
            setLevel=${setLevel}
            level=${level}
            setRefreshLogs=${setRefreshLogs}
          />
        </div>
      </div>

      <div class="row" style=${{ fontFamily: "monospace", fontSize: ".8em" }}>
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

render(html`<${App} />`, globalThis.document.querySelector("#app"));
