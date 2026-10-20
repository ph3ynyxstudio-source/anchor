import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { translations, Language } from "./i18n";
import { MoodEntry } from "./types";
import { EntryForm } from "./components/EntryForm";
import { QrSyncCard } from "./components/QrSyncCard";
import { HistoryList } from "./components/HistoryList";
import { ExportModal } from "./components/ExportModal";
import { PinPad } from "./components/PinPad";
import "./App.css";

type Tab = "entry" | "sync" | "history" | "export";

export function App() {
  const [lang, setLang] = useState<Language>("fr");
  const [activeTab, setActiveTab] = useState<Tab>("entry");
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isConfiguringPin, setIsConfiguringPin] = useState<boolean>(false);
  const [hasPinConfigured, setHasPinConfigured] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [isDetached, setIsDetached] = useState<boolean>(false);

  const t = translations[lang];

  const loadEntries = async () => {
    try {
      const data = await invoke<MoodEntry[]>("get_entries");
      setEntries(data);
    } catch (err) {
      console.error("Failed to load mood entries:", err);
    }
  };

  const checkPinStatus = async () => {
    try {
      const configured = await invoke<boolean>("is_pin_configured");
      setHasPinConfigured(configured);
      if (configured) {
        setIsLocked(true);
      }
    } catch (err) {
      console.error("Failed to check PIN status:", err);
    }
  };

  const checkWindowModes = async () => {
    try {
      const pinned = await invoke<boolean>("get_pin_state");
      const detached = await invoke<boolean>("get_detach_state");
      setIsPinned(pinned);
      setIsDetached(detached);
    } catch (err) {
      console.error("Failed to check window modes:", err);
    }
  };

  useEffect(() => {
    checkPinStatus();
    checkWindowModes();
    loadEntries();
  }, []);

  const handleToggleLang = () => {
    setLang((prev) => (prev === "fr" ? "en" : "fr"));
  };

  const handleTogglePin = async () => {
    try {
      const newPinned = await invoke<boolean>("toggle_pin");
      setIsPinned(newPinned);
    } catch (err) {
      console.error("Failed to toggle pin state:", err);
    }
  };

  const handleToggleDetach = async () => {
    try {
      const newDetached = await invoke<boolean>("toggle_detach");
      setIsDetached(newDetached);
    } catch (err) {
      console.error("Failed to toggle detach state:", err);
    }
  };

  const handleCloseWindow = async () => {
    try {
      await invoke("hide_window");
    } catch (err) {
      console.error("Failed to hide window:", err);
    }
  };

  return (
    <div className={`anchor-app ${isDetached ? "detached" : ""}`}>
      {/* Header */}
      <header className="app-header">
        <div className="header-brand" onClick={() => setActiveTab("entry")}>
          <span className="brand-icon">⚓</span>
          <h1 className="brand-title">{t.app_title}</h1>
        </div>

        <div className="header-actions">
          {/* Ancrer le panneau / Pin Panel (keep open on blur) */}
          <button
            className={`header-btn ${isPinned ? "pinned" : ""}`}
            onClick={handleTogglePin}
            title={isPinned ? t.action_unpin : t.action_pin}
          >
            📌
          </button>

          {/* Ouvrir une vraie fenêtre / Vraie fenêtre détachée */}
          <button
            className={`header-btn ${isDetached ? "active" : ""}`}
            onClick={handleToggleDetach}
            title={isDetached ? t.action_dock : t.action_detach}
          >
            {isDetached ? "🗗" : "⧉"}
          </button>

          {/* Langue */}
          <button
            className="header-btn"
            onClick={handleToggleLang}
            title={t.language_toggle}
          >
            {lang === "fr" ? "EN" : "FR"}
          </button>

          {/* Verrou PIN */}
          <button
            className={`header-btn ${isLocked ? "active" : ""}`}
            onClick={() => {
              if (hasPinConfigured) {
                setIsLocked(true);
              } else {
                setIsConfiguringPin(true);
              }
            }}
            title={hasPinConfigured ? t.pin_prompt : t.pin_set}
          >
            🔒
          </button>

          {/* Fermer */}
          <button
            className="header-btn"
            onClick={handleCloseWindow}
            title={t.close}
          >
            ✕
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="app-body">
        {isLocked ? (
          <PinPad
            t={t}
            onSuccess={() => setIsLocked(false)}
            isSettingPin={false}
          />
        ) : isConfiguringPin ? (
          <PinPad
            t={t}
            onSuccess={() => {
              setIsConfiguringPin(false);
              setHasPinConfigured(true);
            }}
            onCancel={() => setIsConfiguringPin(false)}
            isSettingPin={true}
          />
        ) : activeTab === "sync" ? (
          <QrSyncCard t={t} onClose={() => setActiveTab("entry")} />
        ) : activeTab === "export" ? (
          <ExportModal t={t} onClose={() => setActiveTab("history")} />
        ) : activeTab === "history" ? (
          <HistoryList
            entries={entries}
            t={t}
            onEntryDeleted={loadEntries}
          />
        ) : (
          <EntryForm
            t={t}
            onEntrySaved={() => {
              loadEntries();
            }}
          />
        )}
      </main>

      {/* Footer Navigation */}
      {!isLocked && !isConfiguringPin && (
        <footer className="app-footer">
          <button
            type="button"
            className={`footer-tab-btn ${activeTab === "entry" ? "active" : ""}`}
            onClick={() => setActiveTab("entry")}
          >
            <span className="footer-icon">✍️</span>
            <span>{t.tab_entry}</span>
          </button>

          <button
            type="button"
            className={`footer-tab-btn ${activeTab === "sync" ? "active" : ""}`}
            onClick={() => setActiveTab(activeTab === "sync" ? "entry" : "sync")}
          >
            <span className="footer-icon">📲</span>
            <span>{t.tab_sync}</span>
          </button>

          <button
            type="button"
            className={`footer-tab-btn ${
              activeTab === "history" || activeTab === "export" ? "active" : ""
            }`}
            onClick={() => {
              if (activeTab === "history") {
                setActiveTab("export");
              } else if (activeTab === "export") {
                setActiveTab("entry");
              } else {
                setActiveTab("history");
              }
            }}
          >
            <span className="footer-icon">📋</span>
            <span>
              {activeTab === "history"
                ? t.action_export
                : t.tab_history}
            </span>
          </button>
        </footer>
      )}
    </div>
  );
}

export default App;
