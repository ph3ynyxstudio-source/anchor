GOUVERNANCE — Anchor

Objectif

Ce document définit les règles de gestion du projet, le verrouillage du MVP, la source de vérité et les limites d'action de l'IA.
Il ne décrit PAS le code d'implémentation ni les protocoles réseau.

Classification MVP vs V2+ (MVP LOCK)

INCLUS DANS LE MVP :
- Widget Windows System Tray avec fenêtre volante auto-hide
- Saisie rapide : 3 champs émotions (1 obligatoire, 2 optionnels) + slider 1-10 + zone événement
- Persistance locale SQLite (tauri-plugin-sql)
- Synchronisation Wi-Fi locale par scan de QR Code (serveur Axum)
- Export intervenant (Markdown / texte brut chronologique)
- Verrouillage local par code PIN (4 chiffres)
- Interface bilingue FR/EN
- Thème carnet de notes papier chaleureux

REPORTÉ EN V2+ :
- Graphiques d'évolution et statistiques visuelles
- Reconnaissance vocale ou transcription audio
- Sauvegarde chiffrée sur support externe USB
- Synchronisation Bluetooth


Source de vérité

Code existant → Documentation (docs/) → Interprétation de l'IA


Règles strictes

Règle 1 : L'IA ne doit ajouter aucune dépendance NPM ou Cargo non mentionnée dans les spécifications sans validation.
Règle 2 : Aucune tentative de génération de graphiques (charts) ou d'écrans analytiques ne doit être acceptée.
Règle 3 : Tout comportement imprévu doit privilégier l'échec explicite local plutôt qu'un contournement par un service distant.
Règle 4 : Après chaque modification du code ou de l'architecture, si un document dans docs/ est impacté, il doit être mis à jour immédiatement pour maintenir la documentation en parfaite synchronisation avec le code.

À éviter

- Ne jamais transformer l'application en un tableau de bord médical complexe.
- Ne pas casser le périmètre hors-ligne strict sous prétexte de faciliter la synchronisation.
- Ne pas démarrer une tâche sans avoir vérifié sa présence dans la liste MVP.


Phrase simple

L'humain valide chaque choix.
Le périmètre MVP est strictement verrouillé.
L'outil reste un carnet brut sans graphiques.
