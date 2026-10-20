import { useState, useEffect, useRef, type FC, type FormEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import { IntensitySlider } from "../IntensitySlider";
import { Translations } from "../../i18n";
import { MoodEntryInput } from "../../types";
import "./styles.css";

interface EntryFormProps {
  t: Translations;
  onEntrySaved?: () => void;
}

export const EntryForm: FC<EntryFormProps> = ({ t, onEntrySaved }) => {
  const [e1Label, setE1Label] = useState("");
  const [e1Intensity, setE1Intensity] = useState(5);

  const [e2Label, setE2Label] = useState("");
  const [e2Intensity, setE2Intensity] = useState<number | undefined>(undefined);

  const [e3Label, setE3Label] = useState("");
  const [e3Intensity, setE3Intensity] = useState<number | undefined>(undefined);

  const [dominantEvent, setDominantEvent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const firstInputRef = useRef<HTMLInputElement>(null);

  // Autofocus on first input on mount (Rule 3 in docs/components.md)
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!e1Label.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setFeedbackMsg(t.saving);

    const input: MoodEntryInput = {
      emotion_1_label: e1Label.trim(),
      emotion_1_intensity: e1Intensity,
      emotion_2_label: e2Label.trim() ? e2Label.trim() : null,
      emotion_2_intensity: e2Label.trim() ? (e2Intensity ?? 5) : null,
      emotion_3_label: e3Label.trim() ? e3Label.trim() : null,
      emotion_3_intensity: e3Label.trim() ? (e3Intensity ?? 5) : null,
      dominant_event: dominantEvent.trim(),
    };

    try {
      await invoke("save_entry", { input });
      setFeedbackMsg(t.saved_success);
      // Reset form
      setE1Label("");
      setE1Intensity(5);
      setE2Label("");
      setE2Intensity(undefined);
      setE3Label("");
      setE3Intensity(undefined);
      setDominantEvent("");

      if (onEntrySaved) {
        onEntrySaved();
      }
    } catch (err) {
      console.error("Failed to save entry:", err);
      setFeedbackMsg("Erreur / Error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedbackMsg(""), 2000);
    }
  };

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      {/* Emotion 1: Mandatory */}
      <div className="form-group">
        <label className="form-label" htmlFor="emotion-1">
          {t.emotion_primary}
        </label>
        <div className="input-row">
          <input
            id="emotion-1"
            ref={firstInputRef}
            type="text"
            className="text-input"
            value={e1Label}
            onChange={(e) => setE1Label(e.target.value)}
            placeholder="ex: Anxiété, Colère, Joie..."
            required
            autoComplete="off"
          />
        </div>
        <IntensitySlider
          value={e1Intensity}
          onChange={setE1Intensity}
          label={`${t.emotion_primary} ${t.intensity_scale}`}
        />
      </div>

      {/* Emotion 2: Optional */}
      <div className="form-group">
        <label className="form-label secondary" htmlFor="emotion-2">
          {t.emotion_secondary_1}
        </label>
        <div className="input-row">
          <input
            id="emotion-2"
            type="text"
            className="text-input"
            value={e2Label}
            onChange={(e) => {
              setE2Label(e.target.value);
              if (e.target.value && e2Intensity === undefined) {
                setE2Intensity(5);
              }
            }}
            placeholder="ex: Frustration..."
            autoComplete="off"
          />
        </div>
        {e2Label.trim().length > 0 && (
          <IntensitySlider
            value={e2Intensity ?? 5}
            onChange={(val) => setE2Intensity(val)}
            label={`${t.emotion_secondary_1} ${t.intensity_scale}`}
          />
        )}
      </div>

      {/* Emotion 3: Optional */}
      <div className="form-group">
        <label className="form-label secondary" htmlFor="emotion-3">
          {t.emotion_secondary_2}
        </label>
        <div className="input-row">
          <input
            id="emotion-3"
            type="text"
            className="text-input"
            value={e3Label}
            onChange={(e) => {
              setE3Label(e.target.value);
              if (e.target.value && e3Intensity === undefined) {
                setE3Intensity(5);
              }
            }}
            placeholder="ex: Fatigue..."
            autoComplete="off"
          />
        </div>
        {e3Label.trim().length > 0 && (
          <IntensitySlider
            value={e3Intensity ?? 5}
            onChange={(val) => setE3Intensity(val)}
            label={`${t.emotion_secondary_2} ${t.intensity_scale}`}
          />
        )}
      </div>

      {/* Trigger event */}
      <div className="form-group grow">
        <label className="form-label" htmlFor="dominant-event">
          {t.trigger_event}
        </label>
        <textarea
          id="dominant-event"
          className="textarea-input"
          value={dominantEvent}
          onChange={(e) => setDominantEvent(e.target.value)}
          placeholder={t.placeholder_trigger}
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <div className="form-actions">
        <button
          type="submit"
          className="submit-button"
          disabled={!e1Label.trim() || isSubmitting}
        >
          {isSubmitting ? t.saving : t.action_save}
        </button>
        {feedbackMsg && <span className="feedback-hint">{feedbackMsg}</span>}
      </div>
    </form>
  );
};
