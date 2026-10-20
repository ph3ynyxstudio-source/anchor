# ARCHITECTURE — Anchor

## Objectif
Ce document décrit comment les composants du système communiquent entre eux, les couches logicielles et les flux de données réseau et système.
Il ne décrit PAS l'apparence visuelle, les composants graphiques individuels, ni la structure des tables SQL.

## Couches du système

```txt
[ Interface Frontend (Webview WRY / TypeScript) ]
                     ↓ ↑ (IPC Tauri invoke / events)
[ Moteur Rust (Tauri Core) ]
       ↓ ↑                     ↓ ↑
[ Base SQLite locale ]   [ Serveur Axum (Sync P2P) ]
                                 ↑ (Wi-Fi Local HTTP)
                       [ Client Mobile Android ]
```

## Flux de communication

```txt
Action utilisateur (Desktop) :
Clic Tray → Event Tauri → Affichage instantané fenêtre flottante (380x520)
Saisie entrée → Commande IPC Rust (`save_entry`) → Insertion transactionnelle SQLite → Fermeture du volet (si non épinglé)
Perte de focus (WindowEvent::Focused(false)) → Fermeture automatique de la fenêtre (sauf si épinglé ou détaché)
Bouton 📌 → Commande IPC Rust (`toggle_pin`) → Active/désactive l'inhibition de l'auto-masquage
Bouton ⧉ → Commande IPC Rust (`toggle_detach`) → Bascule entre widget et vraie fenêtre Windows redimensionnable

Action synchronisation (Wi-Fi) :
PC démarre → Axum écoute sur 0.0.0.0:45455 → Affichage QR Code local (`/api/info`)
Mobile scanne QR Code → Requête HTTP POST /api/sync → Réconciliation Last-Write-Wins (LWW) → Mise à jour bilatérale SQLite
```

## Points d'accès réseau (Serveur Axum P2P)

```txt
- GET  /api/status : Contrôle de santé ({ status: "ok", app: "anchor", version: "0.1.0" })
- GET  /api/info   : Informations réseau ({ ip, port, sync_url })
- POST /api/sync   : Synchronisation bilatérale avec arbitrage LWW
- GET  /api/sync   : Lecture des entrées disponibles pour synchronisation
```

## Commandes IPC Tauri

```txt
- save_entry(input)        : Valide, génère UUIDv4/horodatage ISO 8601 UTC, insère dans SQLite et masque le volet si non ancré
- get_entries()            : Récupère les entrées actives (non supprimées)
- delete_entry(id)         : Marquage logique `is_deleted = 1` avec mise à jour du `updated_at`
- export_markdown()        : Génère le journal au format texte brut / Markdown
- get_sync_info()          : Fournit l'IP locale, le port 45455 et l'URL pour le QR Code
- hide_window()            : Masquage explicite de la fenêtre flottante
- toggle_pin()             : Active ou désactive le maintien du panneau ouvert (inhibition de l'auto-masquage sur blur)
- get_pin_state()          : Retourne l'état d'ancrage / épingle du panneau
- toggle_detach()          : Bascule entre mode widget System Tray et mode vraie fenêtre Windows avec bordures
- get_detach_state()       : Retourne l'état de détachement de la fenêtre
- set_pin(pin)             : Enregistrement sécurisé du code PIN
- verify_pin(pin)          : Vérification du code PIN saisi
- is_pin_configured()      : Statut de configuration du code PIN
```

## Règles strictes

```txt
Règle 1 : Tout échange entre l'interface et le disque passe obligatoirement par les commandes IPC Tauri ou le plugin officiel tauri-plugin-sql.
Règle 2 : Le serveur Axum ne doit écouter que sur le réseau local Wi-Fi privé et n'accepter aucun relais vers l'extérieur.
Règle 3 : Aucun appel réseau tiers, infonuagique ou télémétrique n'est autorisé.
```

## À éviter

```txt
- Ne pas intégrer de websocket persistant lourd pour une synchronisation ponctuelle.
- Ne pas autoriser le frontend à dialoguer directement avec le réseau local sans passer par la couche native configurée.
- Ne pas complexifier l'appariement avec un service de découverte mDNS instable sur routeurs domestiques.
```

## Phrase simple

```txt
Le frontend transmet la note au binaire Rust.
Rust l'enregistre en SQLite local.
Axum synchronise les deux appareils en Wi-Fi direct.
```
