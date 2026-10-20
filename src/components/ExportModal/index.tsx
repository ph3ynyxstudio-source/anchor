import { useState, useEffect, type FC } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Translations } from "../../i18n";
import "./styles.css";

interface ExportModalProps {
  t: Translations;
  onClose: () => void;
}

export const ExportModal: FC<ExportModalProps> = ({ t, onClose }) => {
  const [markdown, setMarkdown] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadExport() {
      try {
        const text = await invoke<string>("export_markdown");
        setMarkdown(text);
      } catch (err) {
        console.error("Failed to load markdown export:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadExport();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  return (
    <div className="export-modal">
      <div className="export-header">
        <h3 className="export-title">{t.action_export}</h3>
        <button className="export-close-btn" onClick={onClose} aria-label={t.close}>
          ✕
        </button>
      </div>

      <div className="export-body">
        {isLoading ? (
          <div className="export-loading">...</div>
        ) : (
          <textarea
            className="export-preview"
            value={markdown}
            readOnly
            rows={14}
          />
        )}
      </div>

      <div className="export-footer">
        <button className="export-copy-btn" onClick={handleCopy} disabled={isLoading}>
          {isCopied ? `✓ ${t.copied}` : t.copy_export}
        </button>
      </div>
    </div>
  );
};
