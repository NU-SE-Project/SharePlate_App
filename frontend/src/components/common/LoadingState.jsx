import React from "react";
import { Loader2 } from "lucide-react";

const basePanelClasses =
  "flex items-center justify-center rounded-[2rem] border border-emerald-100 bg-white/80 px-6 py-16 text-center shadow-sm";

export const LoadingSpinner = ({
  className = "h-8 w-8",
  iconClassName = "text-emerald-600",
}) => {
  return <Loader2 className={`${className} animate-spin ${iconClassName}`} />;
};

const LoadingState = ({
  title = "Loading content",
  message = "Please wait while we fetch the latest data.",
  className = "",
  panelClassName = "",
  minHeightClassName = "min-h-[320px]",
  spinnerClassName,
  iconWrapClassName = "",
}) => {
  return (
    <div className={`${basePanelClasses} ${minHeightClassName} ${panelClassName} ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 shadow-lg shadow-emerald-100/60 ${iconWrapClassName}`}
        >
          <LoadingSpinner className={spinnerClassName || "h-8 w-8"} />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
