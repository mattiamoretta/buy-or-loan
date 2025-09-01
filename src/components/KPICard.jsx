import React from "react";

export default function KPICard({ title, value, subtitle, icon: Icon, iconClass = "" }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
      <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
        {Icon && <Icon className={`w-4 h-4 ${iconClass}`} />}
        <span>{title}</span>
      </div>
      <div className="text-lg font-semibold text-orange-600">{value}</div>
      {subtitle && <div className="text-xs text-slate-400">{subtitle}</div>}
    </div>
  );
}
