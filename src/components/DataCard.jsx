import React from "react";

export default function DataCard({ icon: Icon, label, value, hint, iconClass = "" }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3 bg-slate-50 flex items-center gap-3">
      {Icon && <Icon className={`w-5 h-5 ${iconClass}`} />}
      <div className="flex flex-col">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-sm font-medium">{value}</div>
        {hint && <div className="text-xs text-slate-400">{hint}</div>}
      </div>
    </div>
  );
}
