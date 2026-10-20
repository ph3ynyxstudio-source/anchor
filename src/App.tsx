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

  useEffect(() => {
    checkPinStatus();
    loadEntries();
  }, []);

  const handleToggleLang = () => {
    setLang((prev) => (prev === "fr" ? "en" : "fr"));
  };

  const handlePinAction = () => {
    if (hasPinConfigured) {
      setIsLocked(true);
    } else {
      setIsConfiguringPin(true);
    }
  };

  return (
    <div className="anchor-app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-brand" onClick={() => setActiveTab("entry")}>
            <span className="brand-icon">⚓</span>
            <h1 className="brand-title">{t.app_title}</h1>
          </div>

          <div className="header-actions">
            {/* Langue (FR / EN) */}
            <button
              className="header-btn"
              onClick={handleToggleLang}
              title={t.language_toggle}
            >
              {lang === "fr" ? "EN" : "FR"}
            </button>

            {/* Verrou / Configuration PIN (PC & Mobile) */}
            <button
              className={`header-btn pin-btn ${isLocked ? "active" : ""}`}
              onClick={handlePinAction}
              title={hasPinConfigured ? t.pin_prompt : t.pin_set}
              aria-label={hasPinConfigured ? t.pin_prompt : t.pin_set}
            >
              🔒
            </button>
          </div>
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
          <div className="footer-tabs-container">
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
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
