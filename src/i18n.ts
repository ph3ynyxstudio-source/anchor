export type Language = "fr" | "en";

export interface Translations {
  app_title: string;
  emotion_primary: string;
  intensity_scale: string;
  trigger_event: string;
  action_save: string;
  action_export: string;
  action_sync: string;
  pin_prompt: string;
  emotion_secondary_1: string;
  emotion_secondary_2: string;
  placeholder_trigger: string;
  tab_entry: string;
  tab_sync: string;
  tab_history: string;
  history_title: string;
  empty_history: string;
  qr_title: string;
  qr_instruction: string;
  network_ip: string;
  network_status: string;
  copy_export: string;
  copied: string;
  saving: string;
  saved_success: string;
  close: string;
  delete_entry: string;
  pin_set: string;
  pin_unlock: string;
  pin_error: string;
  pin_cancel: string;
  language_toggle: string;
  action_pin: string;
  action_unpin: string;
  action_detach: string;
  action_dock: string;
  sync_client_title: string;
  sync_ip_label: string;
  sync_ip_placeholder: string;
  sync_btn_action: string;
  sync_btn_syncing: string;
  sync_status_idle: string;
  sync_status_success: string;
  sync_status_error: string;
  sync_entries_count: string;
  sync_error_empty_ip: string;
}

export const translations: Record<Language, Translations> = {
  fr: {
    app_title: "Anchor",
    emotion_primary: "Émotion principale *",
    intensity_scale: "Intensité (1 à 10)",
    trigger_event: "Événement ou déclencheur",
    action_save: "Ancrer / Enregistrer",
    action_export: "Exporter pour l'intervenant",
    action_sync: "Synchroniser",
    pin_prompt: "Entrez votre code PIN",
    emotion_secondary_1: "Émotion secondaire (optionnelle)",
    emotion_secondary_2: "Émotion 3 (optionnelle)",
    placeholder_trigger: "Qu'est-ce qui se passe ?",
    tab_entry: "Saisie",
    tab_sync: "Wi-Fi Sync",
    tab_history: "Vue Complète / Export",
    history_title: "Journal des ancrages",
    empty_history: "Aucune entrée enregistrée pour le moment.",
    qr_title: "Synchronisation Wi-Fi Locale",
    qr_instruction: "Scannez ce QR Code avec l'application Android pour synchroniser vos entrées en Wi-Fi direct sans cloud.",
    network_ip: "Adresse locale :",
    network_status: "Serveur Axum P2P actif sur le port 45455",
    copy_export: "Copier le journal Markdown",
    copied: "Copié dans le presse-papiers !",
    saving: "Enregistrement...",
    saved_success: "Point d'ancrage enregistré !",
    close: "Fermer",
    delete_entry: "Supprimer",
    pin_set: "Définir le code PIN",
    pin_unlock: "Déverrouiller",
    pin_error: "Code PIN incorrect",
    pin_cancel: "Annuler",
    language_toggle: "English",
    action_pin: "Ancrer le panneau (garde le volet ouvert)",
    action_unpin: "Désancrer le panneau (auto-masquage au clic externe)",
    action_detach: "Ouvrir dans une vraie fenêtre",
    action_dock: "Réduire en widget flottant",
    sync_client_title: "Synchronisation avec le PC",
    sync_ip_label: "Adresse IP du PC :",
    sync_ip_placeholder: "ex: 192.168.1.50:45455",
    sync_btn_action: "Synchroniser maintenant",
    sync_btn_syncing: "Synchronisation en cours...",
    sync_status_idle: "Prêt pour la synchronisation Wi-Fi locale",
    sync_status_success: "✓ Synchronisation réussie",
    sync_status_error: "✗ Échec de synchronisation",
    sync_entries_count: "entrées à jour",
    sync_error_empty_ip: "Veuillez renseigner l'adresse IP du PC.",
  },
  en: {
    app_title: "Anchor",
    emotion_primary: "Primary emotion *",
    intensity_scale: "Intensity (1 to 10)",
    trigger_event: "Trigger or event",
    action_save: "Set Anchor / Save",
    action_export: "Export for Therapist",
    action_sync: "Sync Now",
    pin_prompt: "Enter your PIN",
    emotion_secondary_1: "Secondary emotion (optional)",
    emotion_secondary_2: "Emotion 3 (optional)",
    placeholder_trigger: "What is happening?",
    tab_entry: "Entry",
    tab_sync: "Wi-Fi Sync",
    tab_history: "Full View / Export",
    history_title: "Anchor Points Journal",
    empty_history: "No entries recorded yet.",
    qr_title: "Local Wi-Fi Sync",
    qr_instruction: "Scan this QR Code with your Android app to sync entries over direct Wi-Fi without cloud.",
    network_ip: "Local Address:",
    network_status: "Axum P2P server active on port 45455",
    copy_export: "Copy Markdown Journal",
    copied: "Copied to clipboard!",
    saving: "Saving...",
    saved_success: "Anchor point saved!",
    close: "Close",
    delete_entry: "Delete",
    pin_set: "Set PIN Code",
    pin_unlock: "Unlock",
    pin_error: "Incorrect PIN code",
    pin_cancel: "Cancel",
    language_toggle: "Français",
    action_pin: "Pin panel (keep panel open)",
    action_unpin: "Unpin panel (auto-hide on blur)",
    action_detach: "Open in a real window",
    action_dock: "Dock back to widget",
    sync_client_title: "Sync with PC",
    sync_ip_label: "PC IP Address:",
    sync_ip_placeholder: "e.g. 192.168.1.50:45455",
    sync_btn_action: "Sync Now",
    sync_btn_syncing: "Syncing...",
    sync_status_idle: "Ready for local Wi-Fi sync",
    sync_status_success: "✓ Sync successful",
    sync_status_error: "✗ Sync failed",
    sync_entries_count: "entries up-to-date",
    sync_error_empty_ip: "Please enter the PC IP address.",
  },
};
