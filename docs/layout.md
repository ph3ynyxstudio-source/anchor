LAYOUT — Anchor

Objectif

Ce document spécifie le découpage de l'espace écran pour la vue bureau (widget / fenêtre détachée) et la vue mobile.
Il ne décrit PAS les couleurs de thème ni le schéma relationnel.

Organisation spatiale Desktop (Fenêtre Tray Flottante : 380px × 520px)

┌──────────────────────────────────────────────┐
│ [⚓ Anchor]           [📌 Ancrer] [⧉ Fenêtre] [FR/EN] [🔒] [✕]│ → Barre d'en-tête
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
│ [ Saisie ]    [ Wi-Fi Sync (QR) ]   [ Export]│ → Pied de widget utilitaire
└──────────────────────────────────────────────┘


Modes d'affichage Desktop

1. Mode Widget Tray (Défaut) :
   - Fenêtre volante 380px × 520px, sans bordure (`decorations: false`), `always_on_top: true`, `skip_taskbar: true`.
   - Perte de focus (`WindowEvent::Focused(false)`) : masque automatiquement la fenêtre (sauf si épinglée).

2. Mode Épinglé / Ancré (Bouton 📌) :
   - Maintient le format widget flottant tout en inhibant la fermeture automatique lors de la perte de focus.
   - Permet de garder le panneau visible tout en consultant ou manipulant d'autres fenêtres.

3. Mode Vraie Fenêtre Détachée (Bouton ⧉) :
   - Active les bordures et la barre de titre standard du système d'exploitation (`decorations: true`).
   - Fenêtre redimensionnable (`resizable: true`), centrée sur l'écran, présente dans la barre des tâches (`skip_taskbar: false`).
   - Permet une consultation élargie et confortable de l'historique et des exports.
   - Un clic sur l'icône 🗗 permet de re-docker instantanément l'application en widget System Tray.


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

Règle 1 : La fenêtre desktop démarre obligatoirement en mode widget avec decorations: false, always_on_top: true et skip_taskbar: true.
Règle 2 : En mode widget non-épinglé, perdre le focus (blur) masque immédiatement la fenêtre.
Règle 3 : Le défilement vertical ne doit apparaître que si la taille de l'écran ou de la fenêtre est insuffisante.


À éviter

- Ne pas forcer le mode vraie fenêtre par défaut au démarrage du widget System Tray.
- Ne pas désactiver l'auto-hide sans action explicite de l'utilisateur (bouton épingle ou détachement).


Phrase simple

Un widget ancré en bas à droite par défaut.
Une option d'épingle pour garder le panneau ouvert.
Un bouton pour détacher en vraie fenêtre Windows à volonté.
