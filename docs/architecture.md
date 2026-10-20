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
Clic Tray → Event Tauri → Affichage instantané fenêtre flottante
Saisie entrée → Commande IPC Rust → Insertion transactionnelle SQLite → Fermeture du volet

Action synchronisation (Wi-Fi) :
PC démarre → Axum écoute sur 0.0.0.0:45455 → Affichage QR Code local
Mobile scanne QR Code → Requête HTTP POST /api/sync → Réconciliation Last-Write-Wins → Mise à jour bilatérale SQLite
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