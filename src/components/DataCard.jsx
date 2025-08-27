import React from "react";

export default function DataCard({
  icon: Icon,
  label,
  value,
  items = null,
  iconClass = "",
}) {
  const content = items || [{ label: "", value }];
  return (
    <div className="rounded-xl border border-slate-200 p-3 bg-slate-50 flex items-center gap-3">
      {Icon && <Icon className={`w-5 h-5 ${iconClass}`} />}
      <div className="flex flex-col w-full">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="flex flex-wrap gap-x-4 mt-1">
          {content.map((it, idx) => (
            <div key={idx} className="flex items-baseline gap-1">
              {it.label && <div className="text-xs font-semibold text-slate-600">{it.label}:</div>}
              <div className="text-sm font-medium text-slate-800">{it.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
