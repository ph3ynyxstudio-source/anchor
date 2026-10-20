LAYOUT — Anchor

Objectif

Ce document spécifie le découpage de l'espace écran pour la vue bureau (widget / fenêtre détachée) et la vue mobile (Android).
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
- Épuration de l'en-tête : masquage des contrôles spécifiques au bureau (épingle 📌, détachement ⧉, fermeture ✕).
- Cibles tactiles conformes aux standards ergonomiques : boutons et champs de saisie à hauteur minimale de 44px à 48px.
- Largeur fluide 100% sans bordures de widget artificielles, défilement vertical tactile fluide.


Règles strictes

Règle 1 : La fenêtre desktop démarre obligatoirement en mode widget avec decorations: false, always_on_top: true et skip_taskbar: true.
Règle 2 : En mode widget desktop non-épinglé, perdre le focus (blur) masque immédiatement la fenêtre.
Règle 3 : Sur mobile, l'interface doit s'adapter en plein écran naturel avec prise en compte des safe area insets et cibles tactiles ≥ 44px.


À éviter

- Ne pas afficher de barre de titre ou de contrôles fenêtrés bureau sur mobile.
- Ne pas contraindre la vue mobile à un format fixe 380px de widget bureau.
- Ne pas placer d'éléments cliquables sous la barre de navigation ou d'état système Android.


Phrase simple

Un widget ancré en bas à droite sur PC.
Une application plein écran ergonomique et tactile sur Android.
L'affichage s'adapte sans compromis à chaque plateforme.
