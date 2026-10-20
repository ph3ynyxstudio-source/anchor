import type { FC } from "react";
import { invoke } from "@tauri-apps/api/core";
import { MoodEntry } from "../../types";
import { Translations } from "../../i18n";
import "./styles.css";

interface HistoryListProps {
  entries: MoodEntry[];
  t: Translations;
  onEntryDeleted?: () => void;
}

export const HistoryList: FC<HistoryListProps> = ({
  entries,
  t,
  onEntryDeleted,
}) => {
  const handleDelete = async (id: string) => {
    try {
      await invoke("delete_entry", { id });
      if (onEntryDeleted) {
        onEntryDeleted();
      }
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  if (entries.length === 0) {
    return (
      <div className="history-empty">
        <p>{t.empty_history}</p>
      </div>
    );
  }

  return (
    <div className="history-list">
      {entries.map((entry) => (
        <div key={entry.id} className="history-item">
          <div className="history-item-header">
            <span className="history-date">{formatDate(entry.created_at)}</span>
            <button
              className="history-delete-btn"
              onClick={() => handleDelete(entry.id)}
              title={t.delete_entry}
            >
              ✕
            </button>
          </div>

          <div className="history-emotions">
            <div className="history-emotion primary">
              <span className="emotion-name">{entry.emotion_1_label}</span>
              <span className="emotion-badge">{entry.emotion_1_intensity}/10</span>
            </div>

            {entry.emotion_2_label && (
              <div className="history-emotion">
                <span className="emotion-name">{entry.emotion_2_label}</span>
                {entry.emotion_2_intensity && (
                  <span className="emotion-badge secondary">
                    {entry.emotion_2_intensity}/10
                  </span>
                )}
              </div>
            )}

            {entry.emotion_3_label && (
              <div className="history-emotion">
                <span className="emotion-name">{entry.emotion_3_label}</span>
                {entry.emotion_3_intensity && (
                  <span className="emotion-badge secondary">
                    {entry.emotion_3_intensity}/10
                  </span>
                )}
              </div>
            )}
          </div>

          {entry.dominant_event && (
            <div className="history-event">
              <span className="event-quote">« {entry.dominant_event} »</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
