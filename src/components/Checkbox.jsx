import React from "react";

export default function Checkbox({ label, checked, onChange, description }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          className="rounded"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        {label}
      </label>
      {description && <span className="text-xs text-slate-500 ml-6">{description}</span>}
    </div>
  );
}
