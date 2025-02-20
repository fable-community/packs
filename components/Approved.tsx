"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";

export const Approved = () => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const tooltipPosition = { top: 5, left: 25 };

  const showTooltip = () => setTooltipVisible(true);
  const hideTooltip = () => setTooltipVisible(false);

  return (
    <div
      className="relative ml-2 p-0.5 bg-white rounded-full"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      <BadgeCheck className="w-3 h-3 text-background" />
      {tooltipVisible && (
        <div
          className="absolute bg-highlight font-bold text-white text-sm rounded px-2 py-1 z-10"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          Official
        </div>
      )}
    </div>
  );
};
