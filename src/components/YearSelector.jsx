import React, { useState, useEffect } from "react";

export default function YearSelector({ label, value, onChange, description }) {
  const presets = [10, 20, 30];
  const [custom, setCustom] = useState(!presets.includes(value));
  useEffect(() => {
    setCustom(!presets.includes(value));
  }, [value]);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-slate-600">{label}</label>
      <div className="flex items-center gap-2 flex-wrap">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            className={`px-3 py-1 rounded-lg text-sm ${
              !custom && value === p ? "bg-orange-600 text-white" : "bg-slate-200 text-slate-600"
            }`}
            onClick={() => {
              onChange(p);
              setCustom(false);
            }}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          className={`px-3 py-1 rounded-lg text-sm ${
            custom ? "bg-orange-600 text-white" : "bg-slate-200 text-slate-600"
          }`}
          onClick={() => setCustom(true)}
        >
          Custom
        </button>
        {custom && (
          <input
            type="number"
            className="w-20 rounded-xl border border-slate-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-300"
            value={value}
            onChange={(e) => onChange(e.target.value === "" ? 0 : parseInt(e.target.value))}
            min={1}
            max={40}
          />
        )}
      </div>
      {description && <span className="text-xs text-slate-500">{description}</span>}
    </div>
  );
}
