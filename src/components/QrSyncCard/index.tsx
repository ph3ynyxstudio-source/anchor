import { useState, useEffect, type FC } from "react";
import { invoke } from "@tauri-apps/api/core";
import { generateQrSvg } from "../../utils/qr";
import { Translations } from "../../i18n";
import { MoodEntry, SyncInfo } from "../../types";
import "./styles.css";

interface QrSyncCardProps {
  t: Translations;
  onClose?: () => void;
  onSyncCompleted?: () => void;
}

interface SyncStatus {
  type: "idle" | "success" | "error";
  message?: string;
  count?: number;
}

export function buildSyncUrl(address: string): string {
  let trimmed = address.trim();
  if (!trimmed) return "";

  if (trimmed.endsWith("/api/sync")) {
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = `http://${trimmed}`;
    }
    return trimmed;
  }

  trimmed = trimmed.replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `http://${trimmed}`;
  }

  try {
    const url = new URL(trimmed);
    if (!url.port) {
      url.port = "45455";
    }
    return `${url.protocol}//${url.hostname}:${url.port}/api/sync`;
  } catch {
    return `${trimmed}:45455/api/sync`;
  }
}

export const QrSyncCard: FC<QrSyncCardProps> = ({ t, onClose, onSyncCompleted }) => {
  const [syncInfo, setSyncInfo] = useState<SyncInfo | null>(null);
  const [qrSvg, setQrSvg] = useState<string>("");
  const [isLoadingInfo, setIsLoadingInfo] = useState<boolean>(true);

  // Client Sync state
  const [pcAddress, setPcAddress] = useState<string>(() => {
    return localStorage.getItem("anchor_sync_target_ip") || "";
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ type: "idle" });

  useEffect(() => {
    async function loadSyncInfo() {
      try {
        const info = await invoke<SyncInfo>("get_sync_info");
        setSyncInfo(info);
        const svg = generateQrSvg(info.sync_url, 140);
        setQrSvg(svg);
        // Clean up stored target if it accidentally matches this device's own IP
        setPcAddress((prev) => {
          if (info.ip && prev && (prev.startsWith(info.ip) || prev.startsWith("127.0.0.1") || prev.startsWith("localhost"))) {
            localStorage.removeItem("anchor_sync_target_ip");
            return "";
          }
          return prev;
        });
      } catch (err) {
        console.error("Failed to get sync info:", err);
      } finally {
        setIsLoadingInfo(false);
      }
    }

    loadSyncInfo();
  }, []);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPcAddress(val);
    localStorage.setItem("anchor_sync_target_ip", val);
  };

  const handleSyncNow = async () => {
    const trimmed = pcAddress.trim();
    if (!trimmed) {
      setSyncStatus({
        type: "error",
        message: t.sync_error_empty_ip,
      });
      return;
    }

    if (syncInfo?.ip && (trimmed.startsWith(syncInfo.ip) || trimmed.startsWith("127.0.0.1") || trimmed.startsWith("localhost"))) {
      setSyncStatus({
        type: "error",
        message: t.sync_error_self_ip,
      });
      return;
    }

    setIsSyncing(true);
    setSyncStatus({ type: "idle" });

    try {
      // 1. Retrieve all local entries from SQLite
      const localEntries = await invoke<MoodEntry[]>("get_entries");

      // 2. Build target URL and send POST /api/sync
      const targetUrl = buildSyncUrl(trimmed);
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ entries: localEntries }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as {
        status: string;
        entries: MoodEntry[];
      };

      // 3. Reconcile remote entries into local SQLite database (LWW)
      const reconciled = await invoke<MoodEntry[]>("reconcile_entries", {
        entries: data.entries || [],
      });

      // 4. Save validated address in localStorage
      localStorage.setItem("anchor_sync_target_ip", trimmed);

      // 5. Update visual status
      const count = reconciled.length;
      setSyncStatus({
        type: "success",
        count,
        message: `${t.sync_status_success} (${count} ${t.sync_entries_count})`,
      });

      // 6. Notify parent component to reload state
      if (onSyncCompleted) {
        onSyncCompleted();
      }
    } catch (err) {
      console.error("Sync error:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setSyncStatus({
        type: "error",
        message: `${t.sync_status_error} (${errorMsg})`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="qr-sync-card">
      {/* Header */}
      <div className="qr-header">
        <h3 className="qr-title">{t.qr_title}</h3>
        {onClose && (
          <button className="qr-close-btn" onClick={onClose} aria-label={t.close}>
            ✕
          </button>
        )}
      </div>

      {/* Client Sync Section */}
      <div className="sync-client-box">
        <h4 className="sync-section-title">{t.sync_client_title}</h4>
        <div className="sync-input-group">
          <label htmlFor="sync-ip-input" className="sync-input-label">
            {t.sync_ip_label}
          </label>
          <input
            id="sync-ip-input"
            type="text"
            className="sync-ip-field"
            value={pcAddress}
            onChange={handleAddressChange}
            placeholder={t.sync_ip_placeholder}
            disabled={isSyncing}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <button
          type="button"
          className="sync-action-btn"
          onClick={handleSyncNow}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <>
              <span className="sync-spinner" aria-hidden="true" />
              <span>{t.sync_btn_syncing}</span>
            </>
          ) : (
            <>
              <span className="sync-btn-icon">⚡</span>
              <span>{t.sync_btn_action}</span>
            </>
          )}
        </button>

        {/* Status feedback message */}
        <div className={`sync-feedback-box ${syncStatus.type}`}>
          {isSyncing ? (
            <div className="sync-status-loading">
              <span className="sync-spinner-small" />
              <span>{t.sync_btn_syncing}</span>
            </div>
          ) : syncStatus.type === "success" ? (
            <div className="sync-status-success">{syncStatus.message}</div>
          ) : syncStatus.type === "error" ? (
            <div className="sync-status-error">{syncStatus.message}</div>
          ) : (
            <div className="sync-status-idle">{t.sync_status_idle}</div>
          )}
        </div>
      </div>

      <div className="sync-divider">
        <span className="divider-line" />
        <span className="divider-text">Wi-Fi Direct</span>
        <span className="divider-line" />
      </div>

      {/* QR Code and Local Server Info */}
      <div className="sync-qr-section">
        <p className="qr-instruction">{t.qr_instruction}</p>

        <div className="qr-box">
          {isLoadingInfo ? (
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
    </div>
  );
};
