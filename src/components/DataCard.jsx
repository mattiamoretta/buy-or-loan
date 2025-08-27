import React from "react";

export default function DataCard({
  icon: Icon,
  label,
  value,
  hint,
  items = null,
  iconClass = "",
}) {
  const content = items || [{ label: "", value, hint }];
  return (
    <div className="rounded-xl border border-slate-200 p-3 bg-slate-50 flex items-center gap-3">
      {Icon && <Icon className={`w-5 h-5 ${iconClass}`} />}
      <div className="flex flex-col">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="flex flex-col divide-y divide-slate-200 mt-1">
          {content.map((it, idx) => (
            <div key={idx} className="pt-1 first:pt-0">
              {it.label && <div className="text-xs font-semibold text-slate-600">{it.label}</div>}
              <div className="text-sm font-medium text-slate-800">{it.value}</div>
              {it.hint && <div className="text-xs text-slate-400">{it.hint}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
