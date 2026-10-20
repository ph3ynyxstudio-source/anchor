LAYOUT — Anchor

Objectif

Ce document spécifie le découpage de l'espace écran pour la vue bureau (fenêtre standard Windows avec raccourci System Tray) et la vue mobile (Android).
Il ne décrit PAS les couleurs de thème ni le schéma relationnel.

Organisation spatiale Desktop (Fenêtre Principale Standard : 480px × 680px)

┌──────────────────────────────────────────────┐
│ Anchor                              —  □  ✕  │ → Barre de titre standard OS (décorations)
├──────────────────────────────────────────────┤
│ [⚓ Anchor]                  [FR/EN]   [🔒]   │ → Barre d'en-tête applicative
├──────────────────────────────────────────────┤
│ Feuille de carnet centrée (max-width: 560px) │
│                                              │
│ Émotion 1 * : [                    ] [1..10] │
│ Émotion 2   : [                    ] [1..10] │ → Zone de saisie active
│ Émotion 3   : [                    ] [1..10] │
│ Événement / Déclencheur :                    │
│ ┌──────────────────────────────────────────┐ │
│ │ Qu'est-ce qui se passe ?                 │ │
│ └──────────────────────────────────────────┘ │
│ [   Enregistrer / Anchor Point   ]           │
├──────────────────────────────────────────────┤
│ [ Saisie ]    [ Wi-Fi Sync (QR) ]   [ Export]│ → Barre d'onglets utilitaire
└──────────────────────────────────────────────┘


Comportement de la fenêtre Desktop

1. Fenêtre Standard Décorée :
   - Dimensions initiales : 480px × 680px (min 380px × 520px).
   - Bordures et barre de titre système (`decorations: true`, boutons natifs réduire, agrandir, fermer).
   - Redimensionnable (`resizable: true`), centrée au premier affichage (`center: true`).
   - Présente dans la barre des tâches Windows (`skipTaskbar: false`).
   - `alwaysOnTop: false` par défaut pour une intégration naturelle dans l'environnement de travail.
   - Ne se masque pas lors de la perte de focus (l'utilisateur peut cliquer sur d'autres fenêtres sans fermer Anchor).

2. Raccourci System Tray (Plateau Système) :
   - Icône ⚓ dans le System Tray.
   - Clic gauche : si la fenêtre est visible et active, elle est masquée (`window.hide()`) ; si elle est masquée ou réduite, elle est restaurée, affichée et mise au premier plan (`window.unminimize()`, `window.show()`, `window.set_focus()`).
   - Fermeture via le bouton standard '✕' de la barre de titre : intercepte `CloseRequested` pour masquer dans le System Tray (`window.hide()`, `api.prevent_close()`), garantissant la disponibilité continue du serveur Axum de synchronisation Wi-Fi P2P.


Organisation spatiale Mobile (Android)

┌────────────────────────────────────────────────────────┐
│ [⚓ Anchor]                           [FR/EN]  [🔒 PIN] │ → Barre système protégée
├────────────────────────────────────────────────────────┤
│ [ Vue Feuille de Carnet Plein Écran ]                  │
│                                                        │
│ Émotion principale * :                                 │
│ [ Saisie texte haute (≥ 44px)                        ] │
│ [ 1 ][ 2 ][ 3 ][ 4 ][ 5 ][ 6 ][ 7 ][ 8 ][ 9 ][ 10 ]     │ → Boutons tactiles ≥ 44px
│                                                        │
│ Émotion secondaire :                                   │
│ [ Saisie texte haute (≥ 44px)                        ] │
│                                                        │
│ Événement ou déclencheur :                             │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Qu'est-ce qui se passe ? (min-height ≥ 84px)       │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ [       Ancrer / Enregistrer (hauteur 48px)          ] │
├────────────────────────────────────────────────────────┤
│ [ ✍️ Saisie ]    [ 📲 Wi-Fi Sync ]    [ 📋 Export ]    │ → Onglets ergonomiques (≥ 48px)
└────────────────────────────────────────────────────────┘

Spécifications ergonomiques Mobile :
- Respect impératif des Safe Area Insets (barre d'état Android et barre de navigation par gestes) : `viewport-fit=cover`, `env(safe-area-inset-top)` et `env(safe-area-inset-bottom)`.
- En-tête épuré et identique : logo `⚓ Anchor`, sélecteur bilingue `[FR/EN]`, cadenas de verrouillage `[🔒 PIN]`.
- Cibles tactiles conformes aux standards ergonomiques : boutons et champs de saisie à hauteur minimale de 44px à 48px.
- Largeur fluide 100% sans bordures de widget artificielles, défilement vertical tactile fluide.


Règles strictes

Règle 1 : La fenêtre desktop démarre en fenêtre standard décorée avec `decorations: true`, `resizable: true`, `skipTaskbar: false` et `alwaysOnTop: false`.
Règle 2 : Le clic sur le System Tray bascule visibilité/masquage ; la fermeture '✕' masque vers le System Tray pour préserver le serveur de sync Wi-Fi.
Règle 3 : Sur mobile, l'interface s'adapte en plein écran naturel avec prise en compte des safe area insets et cibles tactiles ≥ 44px.


À éviter

- Ne pas forcer la fermeture brutale du processus lors du clic '✕' bureau sans passer par le tray (ce qui couperait les synchronisations Wi-Fi en cours).
- Ne pas contraindre la vue mobile à un format fixe de widget bureau.
- Ne pas placer d'éléments cliquables sous la barre de navigation ou d'état système Android.


Phrase simple

Une fenêtre standard redimensionnable avec accès rapide System Tray sur PC.
Une application plein écran ergonomique et tactile sur Android.
L'affichage s'adapte sans compromis à chaque plateforme.
