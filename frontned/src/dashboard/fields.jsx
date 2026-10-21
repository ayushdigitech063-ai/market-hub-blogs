import React, { useState, useRef } from "react";
import { UploadCloud, Loader2, Trash2 } from "lucide-react";
import { API, authFetch } from "./config";
import { inputClass } from "./ui";

const MAX_IMAGE_MB = 5;


export function ImageField({ field, value, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const setValue = (v) => onChange({ target: { name: field.name, value: v } });

  const upload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file only (JPG, PNG, WEBP, or GIF)..");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    setError(`Image must be smaller than ${MAX_IMAGE_MB}MB.`);
      return;
    }
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await authFetch(`${API}/upload`, { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || "Upload fail ho gaya.");
      else setValue(data.url);
    } catch (err) {
      setError("Unable to connect to the server.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    upload(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex items-center gap-4 rounded-xl border border-dashed p-3 transition ${
          dragOver ? "border-orange-400 bg-orange-50" : "border-orange-200 bg-orange-50/30"
        }`}
      >
        {value ? (
          <img src={value} alt="Preview"
            className="h-16 w-16 shrink-0 rounded-lg border border-orange-100 bg-white object-cover" />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-orange-100/60 text-orange-500">
            <UploadCloud className="h-6 w-6" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-700">
         {uploading ? "Uploading..." : value ? "Image selected" : "Drag & drop image here"}
          </p>
          <p className="text-[11px] text-slate-400">JPG, PNG, WEBP, GIF • max {MAX_IMAGE_MB}MB</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
              {value ? "Change image" : "Choose from device"}
            </button>
            {value && !uploading && (
              <button type="button" onClick={() => setValue("")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-100">
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            )}
          </div>
        </div>

        <input ref={inputRef} type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0])} className="hidden" />
      </div>

      <input type="text" name={field.name} value={value} onChange={onChange} required={field.required}
        placeholder="paste the image link here" className={inputClass} />
      {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
    </div>
  );
}


export const uniqueOptions = (values) => {
  const seen = new Map();
  values.forEach((v) => {
    const s = String(v ?? "").trim();
    if (s && !seen.has(s.toLowerCase())) seen.set(s.toLowerCase(), s);
  });
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
};

const NEW_VALUE = "__new__";


export function ComboField({ field, value, onChange }) {
  const options = field.options || [];
  const [custom, setCustom] = useState(false);
  const matched = options.find((o) => o.toLowerCase() === String(value || "").toLowerCase());
  const isCustom = custom || (value !== "" && !matched);
  const setValue = (v) => onChange({ target: { name: field.name, value: v } });

  return (
    <div className="space-y-2">
      <select
        value={isCustom ? NEW_VALUE : matched || ""}
        onChange={(e) => {
          if (e.target.value === NEW_VALUE) {
            setCustom(true);
            setValue("");
          } else {
            setCustom(false);
            setValue(e.target.value);
          }
        }}
        className={inputClass}
      >
        <option value="">{field.placeholder || "Select"}</option>
        {options.map((o) => (<option key={o} value={o}>{o}</option>))}
        <option value={NEW_VALUE}>+ Add new...</option>
      </select>
      {isCustom && (
        <input type="text" value={value} onChange={(e) => setValue(e.target.value)} autoFocus
          placeholder={`Enter new ${field.label.split(" ")[0].toLowerCase()}`} className={inputClass} />
      )}
    </div>
  );
}

export function Field({ field, value, onChange, editing }) {
  const disabled = editing && field.lockOnEdit;
  let options = field.options || [];
  if (field.type === "select" && value && !options.some((o) => o.value === value)) {
    options = [...options, { value, label: value }];
  }
  return (
    <div className={field.span2 ? "md:col-span-2" : ""}>
      <label className="mb-1 block text-xs font-semibold text-slate-600">
        {field.label}
        {field.required && <span className="ml-0.5 text-orange-500">*</span>}
      </label>
      {field.type === "image" ? (
        <ImageField field={field} value={value} onChange={onChange} />
      ) : field.type === "combo" ? (
        <ComboField field={field} value={value} onChange={onChange} />
      ) : field.type === "textarea" ? (
        <textarea name={field.name} value={value} onChange={onChange} rows={field.rows || 3}
          required={field.required} placeholder={field.placeholder} className={inputClass} />
      ) : field.type === "select" ? (
        <select name={field.name} value={value} onChange={onChange} required={field.required} className={inputClass}>
          <option value="">{field.placeholder || "Select"}</option>
          {options.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
        </select>
      ) : (
        <input type={field.type || "text"} name={field.name} value={value} onChange={onChange}
          required={field.required} disabled={disabled} placeholder={field.placeholder} className={inputClass} />
      )}
      {field.hint && <p className="mt-1 text-[11px] text-slate-400">{field.hint}</p>}
      {disabled && <p className="mt-1 text-[11px] text-slate-400">This field did not change during Edititng</p>}
    </div>
  );
}
