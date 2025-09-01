import React from "react";

export default function Stepper({ step }) {
  const labels = ["Scenari", "Mutuo", "Patrimonio", "Investimenti", "Risultati"];
  const isFinal = step === labels.length;
  return (
    <div className="flex items-center mb-8">
      {labels.map((label, idx) => {
        const num = idx + 1;
        const active = step === num;
        const completed = step > num;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                  active || completed ? "bg-orange-600 text-white" : "bg-slate-200 text-slate-600"
                }`}
              >
                {num}
              </div>
              <span className={`mt-2 text-xs ${isFinal ? "text-white" : "text-slate-600"}`}>{label}</span>
            </div>
            {idx < labels.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 ${
                  step > num ? "bg-orange-600" : "bg-slate-300"
                }`}
              ></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
