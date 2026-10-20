LAYOUT — Anchor

Objectif

Ce document spécifie le découpage de l'espace écran pour la vue bureau (widget) et la vue mobile.
Il ne décrit PAS les couleurs de thème ni le schéma relationnel.

Organisation spatiale Desktop (Fenêtre Tray Flottante : 380px × 520px)

┌──────────────────────────────────────────────┐
│ [⚓ Anchor]                       [⚙] [Pin 🔒]│ → Barre d'en-tête discrète
├──────────────────────────────────────────────┤
│ Émotion 1 * : [                    ] [1..10] │
│ Émotion 2   : [                    ] [1..10] │ → Zone de saisie active
│ Émotion 3   : [                    ] [1..10] │
│ Événement / Déclencheur :                    │
│ ┌──────────────────────────────────────────┐ │
│ │ Qu'est-ce qui se passe ?                 │ │
│ └──────────────────────────────────────────┘ │
│ [   Enregistrer / Anchor Point   ]           │
├──────────────────────────────────────────────┤
│ [ Wi-Fi Sync (QR) ]   [ Vue Complète / Export]│ → Pied de widget utilitaire
└──────────────────────────────────────────────┘


Organisation spatiale Mobile (Android)

┌──────────────────────────────────────────────┐
│ [⚓ Anchor]                       [Pin 🔒]   │
├──────────────────────────────────────────────┤
│ [ Vue Feuille de Carnet ]                    │
│ - Champs émotions et slider                  │
│ - Zone texte déclencheur                     │
│ - Bouton enregistrer                         │
├──────────────────────────────────────────────┤
│ [ Export Intervenant ]    [ Synchroniser 📲 ] │
└──────────────────────────────────────────────┘


Règles strictes

Règle 1 : La fenêtre desktop doit obligatoirement avoir decorations: false, always_on_top: true et skip_taskbar: true.
Règle 2 : Perdre le focus (blur) sur desktop doit immédiatement masquer la fenêtre.
Règle 3 : Le défilement vertical ne doit apparaître que si la taille de l'écran mobile est insuffisante.


À éviter

- Ne pas afficher de barre de titre Windows standard sur le widget flottant.
- Ne pas autoriser le redimensionnement manuel de la vue widget.


Phrase simple

Un widget ancré en bas à droite sur PC.
Une page carnet verticale sur mobile.
Disparaît dès qu'on clique ailleurs.
