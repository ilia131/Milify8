"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { api } from "./client";

export type Row = Record<string, unknown>;
export type Field = readonly [name: string, label: string, kind?: "number" | "email" | "password" | "file" | "date" | "ids" | "datetime-local" | "textarea" | "boolean" | readonly string[], required?: boolean];
type Mutation = { path: string; fields: readonly Field[]; method?: "POST" | "PATCH" | "PUT"; multipart?: boolean };
type RowMutation = Omit<Mutation, "path"> & { path: (id: string) => string };
type Action = { label: string; path: (id: string) => string; method?: "PATCH" | "DELETE"; confirm?: string };
export type Resource = {
  title: string;
  endpoint: string;
  columns: readonly (readonly [string, string])[];
  search?: boolean;
  id?: string;
  create?: Mutation;
  edit?: RowMutation;
  actions?: readonly Action[];
};

const labels: Record<string, string> = {
  OPEN: "باز", IN_PROGRESS: "در حال بررسی", ANSWERED: "پاسخ داده‌شده", CLOSED: "بسته",
  PENDING: "در انتظار", ACTIVE: "فعال", EXPIRED: "پایان‌یافته", CANCELLED: "لغوشده",
  SUCCESS: "موفق", FAILED: "ناموفق", APPROVED: "تأییدشده", REJECTED: "ردشده",
  DRAFT: "پیش‌نویس", PAUSED: "متوقف", COMPLETED: "تکمیل‌شده", IMAGE: "تصویر", VIDEO: "ویدیو",
  PLATFORM: "میلیفای", ARTIST: "هنرمند", HOME: "خانه", SEARCH: "جست‌وجو",
  PLAYER: "پخش‌کننده", ALBUM: "آلبوم", DISCOVERY: "کشف",
};

function display(value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "بله" : "خیر";
  if (Array.isArray(value)) return value.map(display).join("، ");
  if (typeof value === "object") {
    const record = value as Row;
    return display(record.title ?? record.name ?? record.artistname ?? record.username ?? record.email ?? record.id);
  }
  return typeof value === "string" && Object.hasOwn(labels, value) ? labels[value] : String(value);
}

function valueAt(row: Row, key: string): unknown {
  return key.split(".").reduce<unknown>((value, part) => value && typeof value === "object" ? (value as Row)[part] : undefined, row);
}

export function Editor({ mutation, row, onDone, title }: {
  mutation: Mutation; row?: Row; onDone: () => void; title: string;
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = new FormData(event.currentTarget);
    const body = new FormData();
    const json: Row = {};
    for (const [name, , kind] of mutation.fields) {
      const value = input.get(name);
      if (value instanceof File && !value.size) continue;
      if (typeof value === "string" && value === "" && kind !== "textarea" && kind !== undefined) continue;
      if (typeof value === "string" && !value && (name === "password" || name === "username")) continue;
      if (kind === "ids" && typeof value === "string") {
        const values = value.split(/[,،]/).map((item) => item.trim()).filter(Boolean);
        if (!values.every((item) => /^[1-9]\d*$/.test(item))) {
          setError("شناسه‌ها باید عدد صحیح مثبت و جداشده با ویرگول باشند.");
          return;
        }
        json[name] = values.map(Number);
        values.forEach((item) => body.append(name, item));
      } else if (kind === "boolean") {
        const checked = value === "on";
        json[name] = checked;
        body.set(name, String(checked));
      } else if (value != null) {
        json[name] = value;
        body.set(name, value);
      }
    }
    setError("");
    setPending(true);
    try {
      await api(mutation.path, {
        method: mutation.method ?? "POST",
        body: mutation.multipart ? body : JSON.stringify(json),
        headers: mutation.multipart ? undefined : { "Content-Type": "application/json" },
      });
      onDone();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "ذخیره انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  return <form onSubmit={submit} className="panel-card panel-form">
    <h2>{title}</h2>
    {mutation.fields.map(([name, label, kind, required]) => {
      const value = row?.[name];
      const text = value == null ? "" : typeof value === "object" ? display(valueAt(row ?? {}, `${name}.id`)) : String(value);
      return <label key={name}>{label}
        {kind === "boolean" ? <input name={name} type="checkbox" defaultChecked={value === true} /> :
          kind === "textarea" ? <textarea name={name} defaultValue={text} required={required} /> :
          Array.isArray(kind) ? <select name={name} defaultValue={text} required={required}>
            <option value="">انتخاب کنید</option>
            {kind.map((item) => <option key={item} value={item}>{display(item)}</option>)}
          </select> :
          <input name={name} type={typeof kind === "string" && kind !== "ids" ? kind : "text"} required={required}
            step={kind === "number" ? "any" : undefined}
            defaultValue={kind === "file" || kind === "password" ? undefined : text} />}
      </label>;
    })}
    <button disabled={pending}>{pending ? "در حال ذخیره…" : "ذخیره"}</button>
    {error && <p role="alert">{error}</p>}
  </form>;
}

type Page = { results: Row[]; next?: string | null; previous?: string | null };

export function ResourcePage({ resource }: { resource: Resource }) {
  const [result, setResult] = useState<Page | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [revision, setRevision] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [editor, setEditor] = useState<true | Row | null>(null);
  const [pendingAction, setPendingAction] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    api<Row[] | Page>(`${resource.endpoint}?${params}`, { signal: controller.signal }).then((data) => {
      if (!controller.signal.aborted) setResult(Array.isArray(data) ? { results: data } : data);
    }).catch((failure) => {
      if (!controller.signal.aborted) setLoadError(failure instanceof Error ? failure.message : "بارگذاری انجام نشد.");
    });
    return () => controller.abort();
  }, [page, resource.endpoint, revision, search]);

  function reload() {
    setLoadError("");
    setResult(null);
    setRevision((value) => value + 1);
  }
  function saved() {
    setEditor(null);
    setMessage("تغییرات ذخیره شد.");
    reload();
  }
  async function run(action: Action, id: string) {
    if (action.confirm && !window.confirm(action.confirm)) return;
    setPendingAction(true);
    setMessage("");
    try {
      await api(action.path(id), { method: action.method ?? "PATCH" });
      setMessage("عملیات انجام شد.");
      reload();
    } catch (failure) {
      setMessage(failure instanceof Error ? failure.message : "عملیات انجام نشد.");
    } finally {
      setPendingAction(false);
    }
  }

  const id = (row: Row) => String(row[resource.id ?? "id"]);
  const selected = editor === true ? resource.create : editor && resource.edit
    ? { ...resource.edit, path: resource.edit.path(id(editor)) } : null;

  return <>
    <h1>{resource.title}</h1>
    <div className="panel-toolbar">
      {resource.search && <form onSubmit={(event) => {
        event.preventDefault();
        const query = String(new FormData(event.currentTarget).get("search") ?? "").trim();
        if (query === search && page === 1) return;
        setPage(1); setSearch(query); setResult(null); setLoadError("");
      }}><input name="search" type="search" aria-label="جست‌وجو" placeholder="جست‌وجو" /><button>جست‌وجو</button></form>}
      {resource.create && <button type="button" onClick={() => setEditor(true)}>ایجاد</button>}
    </div>
    {message && <p role="status">{message}</p>}
    {selected && <div>
      <Editor key={editor === true ? "new" : id(editor as Row)} mutation={selected}
        row={editor === true ? undefined : editor as Row} title={editor === true ? "ایجاد" : "ویرایش"} onDone={saved} />
      <button type="button" className="panel-secondary" onClick={() => setEditor(null)}>بستن فرم</button>
    </div>}
    {loadError ? <div role="alert"><p>{loadError}</p><button onClick={reload}>تلاش دوباره</button></div> :
      !result ? <p role="status">در حال بارگذاری…</p> :
      result.results.length === 0 ? <p>موردی برای نمایش وجود ندارد.</p> :
      <div className="panel-table"><table>
        <thead><tr>{resource.columns.map(([key, title]) => <th key={key} scope="col">{title}</th>)}{(resource.edit || resource.actions) && <th scope="col">عملیات</th>}</tr></thead>
        <tbody>{result.results.map((row, index) => <tr key={row[resource.id ?? "id"] != null ? id(row) : index}>
          {resource.columns.map(([key]) => <td key={key}>{display(valueAt(row, key))}</td>)}
          {(resource.edit || resource.actions) && <td><div className="panel-actions">
            {resource.edit && <button type="button" className="panel-secondary" onClick={() => setEditor(row)}>ویرایش</button>}
            {resource.actions?.map((action) => <button type="button" key={action.label} className="panel-secondary" disabled={pendingAction} onClick={() => run(action, id(row))}>{action.label}</button>)}
          </div></td>}
        </tr>)}</tbody>
      </table></div>}
    {result && (result.next || result.previous) && <div className="panel-toolbar" aria-label="صفحه‌بندی">
      <button disabled={!result.previous} onClick={() => { setPage(page - 1); setResult(null); }}>قبل</button>
      <button disabled={!result.next} onClick={() => { setPage(page + 1); setResult(null); }}>بعد</button>
    </div>}
  </>;
}

export function LiveData<T>({ endpoint, children }: { endpoint: string; children: (value: T, reload: () => void) => ReactNode }) {
  const [result, setResult] = useState<{ value: T } | null>(null);
  const [failure, setFailure] = useState("");
  const [revision, setRevision] = useState(0);
  function reload() { setResult(null); setFailure(""); setRevision(revision + 1); }

  useEffect(() => {
    const controller = new AbortController();
    api<T>(endpoint, { signal: controller.signal }).then((value) => {
      if (!controller.signal.aborted) setResult({ value });
    }).catch((error) => {
      if (!controller.signal.aborted) setFailure(error instanceof Error ? error.message : "بارگذاری انجام نشد.");
    });
    return () => controller.abort();
  }, [endpoint, revision]);

  return failure ? <div><p role="alert">{failure}</p><button onClick={reload}>تلاش دوباره</button></div> :
    result ? children(result.value, reload) : <p role="status">در حال بارگذاری…</p>;
}
