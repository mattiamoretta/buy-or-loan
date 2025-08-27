import React from "react";

export default function DataCard({
  icon: Icon,
  label,
  value,
  items = null,
  iconClass = "",
  featured = false,
}) {
  const content = items || [{ label: null, value }];
  return (
    <div
      className={
        featured
          ? "rounded-2xl border-2 border-emerald-200 p-4 bg-emerald-50 flex items-center gap-4 shadow"
          : "rounded-xl border border-slate-200 p-3 bg-slate-50 flex items-center gap-3"
      }
    >
      {Icon && (
        <Icon className={`${featured ? "w-6 h-6" : "w-5 h-5"} ${iconClass}`} />
      )}
      <div className="flex flex-col w-full">
        <div className={featured ? "text-sm text-emerald-700" : "text-xs text-slate-500"}>{label}</div>
        <div className="mt-1 space-y-1">
          {content.map((it, idx) => (
            <div
              key={idx}
              className={`flex items-baseline ${it.label ? "justify-between" : "justify-end"}`}
            >
              {it.label && (
                <div
                  className={
                    featured
                      ? "text-sm font-semibold text-emerald-800"
                      : "text-xs font-semibold text-slate-600"
                  }
                >
                  {it.label}
                </div>
              )}
              <div
                className={
                  featured
                    ? "text-lg font-bold text-emerald-800"
                    : "text-sm font-medium text-slate-800"
                }
              >
                {it.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
