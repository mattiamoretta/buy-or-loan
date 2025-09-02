import React from "react";

export default function Stepper({ step, labels }) {
  const isFinal = step === labels.length;
  return (
    <div className="flex items-center mb-8">
      {labels.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = step === stepNumber;
        const isCompleted = step > stepNumber;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                  isActive || isCompleted ? "bg-orange-600 text-white" : "bg-slate-200 text-slate-600"
                }`}
              >
                {stepNumber}
              </div>
              <span className={`mt-2 text-xs ${isFinal ? "text-white" : "text-slate-600"}`}>{label}</span>
            </div>
            {index < labels.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 ${
                  step > stepNumber ? "bg-orange-600" : "bg-slate-300"
                }`}
              ></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
