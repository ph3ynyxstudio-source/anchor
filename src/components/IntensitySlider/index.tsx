import type { FC, KeyboardEvent } from "react";
import "./styles.css";

interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
}

export const IntensitySlider: FC<IntensitySliderProps> = ({
  value,
  onChange,
  disabled = false,
  label = "1..10",
}) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(10, value + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(1, value - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(1);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(10);
    }
  };

  return (
    <div
      className="intensity-slider"
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="intensity-buttons">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((step) => {
          const isSelected = value === step;
          return (
            <button
              key={step}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              className={`intensity-btn ${isSelected ? "active" : ""}`}
              onClick={() => onChange(step)}
              title={`Intensité ${step}`}
            >
              {step}
            </button>
          );
        })}
      </div>
    </div>
  );
};
