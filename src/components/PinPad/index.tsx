import { useState, useEffect, type FC } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Translations } from "../../i18n";
import "./styles.css";

interface PinPadProps {
  t: Translations;
  onSuccess: () => void;
  onCancel?: () => void;
  isSettingPin?: boolean;
}

export const PinPad: FC<PinPadProps> = ({
  t,
  onSuccess,
  onCancel,
  isSettingPin = false,
}) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin.length === 4) {
      handleComplete(pin);
    }
  }, [pin]);

  const handleComplete = async (code: string) => {
    try {
      if (isSettingPin) {
        await invoke("set_pin", { pin: code });
        onSuccess();
      } else {
        const isValid = await invoke<boolean>("verify_pin", { pin: code });
        if (isValid) {
          onSuccess();
        } else {
          setError(true);
          setPin("");
          setTimeout(() => setError(false), 1500);
        }
      }
    } catch (err) {
      console.error("PIN check failed:", err);
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 1500);
    }
  };

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="pin-pad">
      <div className="pin-title">
        {isSettingPin ? t.pin_set : t.pin_prompt}
      </div>

      <div className={`pin-dots ${error ? "shake" : ""}`}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`pin-dot ${i < pin.length ? "filled" : ""}`}
          />
        ))}
      </div>

      {error && <div className="pin-error-text">{t.pin_error}</div>}

      <div className="pin-grid">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
          <button
            key={num}
            type="button"
            className="pin-key"
            onClick={() => handleDigit(num)}
          >
            {num}
          </button>
        ))}
        {onCancel ? (
          <button
            type="button"
            className="pin-key action"
            onClick={onCancel}
          >
            ✕
          </button>
        ) : (
          <div className="pin-key empty" />
        )}
        <button
          type="button"
          className="pin-key"
          onClick={() => handleDigit("0")}
        >
          0
        </button>
        <button
          type="button"
          className="pin-key action"
          onClick={handleBackspace}
        >
          ⌫
        </button>
      </div>
    </div>
  );
};
