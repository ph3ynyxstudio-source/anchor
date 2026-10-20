import { useState, useEffect, type FC } from "react";
import { invoke } from "@tauri-apps/api/core";
import { generateQrSvg } from "../../utils/qr";
import { Translations } from "../../i18n";
import { SyncInfo } from "../../types";
import "./styles.css";

interface QrSyncCardProps {
  t: Translations;
  onClose?: () => void;
}

export const QrSyncCard: FC<QrSyncCardProps> = ({ t, onClose }) => {
  const [syncInfo, setSyncInfo] = useState<SyncInfo | null>(null);
  const [qrSvg, setQrSvg] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSyncInfo() {
      try {
        const info = await invoke<SyncInfo>("get_sync_info");
        setSyncInfo(info);
        const svg = generateQrSvg(info.sync_url, 160);
        setQrSvg(svg);
      } catch (err) {
        console.error("Failed to get sync info:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSyncInfo();
  }, []);

  return (
    <div className="qr-sync-card">
      <div className="qr-header">
        <h3 className="qr-title">{t.qr_title}</h3>
        {onClose && (
          <button className="qr-close-btn" onClick={onClose} aria-label={t.close}>
            ✕
          </button>
        )}
      </div>

      <p className="qr-instruction">{t.qr_instruction}</p>

      <div className="qr-box">
        {isLoading ? (
          <div className="qr-placeholder">...</div>
        ) : (
          <div
            className="qr-image"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
        )}
      </div>

      <div className="qr-details">
        <div className="qr-detail-row">
          <span className="qr-detail-label">{t.network_ip}</span>
          <span className="qr-detail-value">{syncInfo ? syncInfo.ip : "..."}</span>
        </div>
        <div className="qr-detail-badge">
          <span className="status-dot" />
          <span>{t.network_status}</span>
        </div>
      </div>
    </div>
  );
};
