import React, { useState, useEffect } from "react";

export default function Field({ label, value, onChange, min, max, step, prefix, suffix, description }) {
  const decimals = step && step < 1 ? step.toString().split(".")[1]?.length || 0 : 0;
  const fmtNumber = (n) =>
    n.toLocaleString("it-IT", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  const parseNumber = (str) => {
    const cleaned = str.replace(/\./g, "").replace(",", ".");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };
  const [display, setDisplay] = useState(fmtNumber(value));
  useEffect(() => {
    setDisplay(fmtNumber(value));
  }, [value]);
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-slate-600">{label}</label>}
      <div className="flex items-center gap-2">
        {prefix && <span className="text-slate-500 text-sm">{prefix}</span>}
        <input
          type="text"
          inputMode="decimal"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
          value={display}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              setDisplay("");
              onChange(0);
            } else {
              const num = parseNumber(val);
              setDisplay(fmtNumber(num));
              onChange(num);
            }
          }}
          min={min}
          max={max}
          step={step}
        />
        {suffix && <span className="text-slate-500 text-sm">{suffix}</span>}
      </div>
      {description && <span className="text-xs text-slate-500">{description}</span>}
    </div>
  );
}
