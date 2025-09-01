import React from "react";
import Field from "./Field";

export default function DownPaymentField({ price, downPct, setDownPct, mode, setMode }) {
  const value = mode === 'pct' ? downPct * 100 : price * downPct;
  const handleChange = (v) => {
    if (mode === 'pct') setDownPct(v / 100);
    else setDownPct(price ? v / price : 0);
  };
  const max = mode === 'pct' ? 90 : price;
  const step = mode === 'pct' ? 1 : 1000;
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-slate-600">Anticipo</label>
      <div className="flex items-center gap-2">
        <div className="flex rounded-xl overflow-hidden border border-slate-300">
          <button
            type="button"
            className={`px-3 py-1 text-sm ${mode === 'pct' ? 'bg-orange-600 text-white' : 'bg-white text-slate-600'}`}
            onClick={() => setMode('pct')}
          >
            %
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-sm ${mode === 'amt' ? 'bg-orange-600 text-white' : 'bg-white text-slate-600'}`}
            onClick={() => setMode('amt')}
          >
            €
          </button>
        </div>
        <Field
          value={value}
          onChange={handleChange}
          min={0}
          max={max}
          step={step}
          suffix={mode === 'pct' ? '%' : '€'}
        />
      </div>
      <span className="text-xs text-slate-500">
        {mode === 'pct'
          ? 'Percentuale di anticipo che puoi versare'
          : "Importo dell'anticipo che puoi versare"}
      </span>
    </div>
  );
}
