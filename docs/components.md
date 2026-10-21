COMPOSANTS — Anchor

Objectif

Ce document définit la liste, la structure et la hiérarchie des composants d'interface réutilisables.
Il ne décrit PAS la logique de stockage ni la couche réseau Rust.

Arborescence des composants

src/components/
  EntryForm/          → Formulaire de saisie des 3 émotions et de l'événement
  IntensitySlider/    → Sélecteur numérique 1 à 10 discret
  QrSyncCard/         → Affichage du QR code, saisie IP et client de synchronisation P2P
  PinPad/             → Clavier numérique de déverrouillage sécurisé
  ExportModal/        → Sélection de période et génération du document intervenant
  HistoryList/        → Liste chronologique sobre des entrées passées


Structure d'un composant

NomDuComposant/
  index.ts (ou .svelte / .tsx)
  styles.css (tokens de thème uniquement)


Règles strictes

Règle 1 : Chaque composant est isolé dans son dossier avec sa logique et ses styles.
Règle 2 : IntensitySlider doit être manipulable au clavier (flèches) ou au doigt/souris avec un retour visuel immédiat.
Règle 3 : EntryForm doit comporter un autofocus sur le premier champ dès l'ouverture du widget.


À éviter

- Ne pas importer de bibliothèque externe de composants UI lourds (pas de MUI, Tailwind complet ou Shadcn surdimensionné).
- Ne pas imbriquer des composants au-delà de 2 niveaux de profondeur.
- Ne pas ajouter d'animations décoratives lentes qui retardent la saisie immédiate.


Phrase simple

Des composants simples et autonomes.
Zéro framework de style encombrant.
Saisie immédiate dès l'affichage.
