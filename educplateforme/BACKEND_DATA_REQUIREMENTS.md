
## Regles generales

- Aucune liste de cours, quiz, badges, livres, notes, notifications ou statistiques ne doit etre codee en dur dans le frontend.
- Chaque ecran doit gerer 4 etats:
  - `idle`
  - `loading`
  - `success`
  - `error`
- Les objets doivent venir du backend avec des `id` stables.
- Les dates doivent etre fournies en ISO 8601.
- Les listes longues doivent etre paginables ou filtrables.

## Donnees attendues par ecran

### Dashboard

- Profil utilisateur connecte
- KPIs utilisateur
- Cours inscrits
- Progression des cours
- Activite recente
- Badges obtenus
- Recommandations de cours

### Courses

- Liste paginee des cours
- Categories
- Niveaux de difficulte
- Cours vedettes
- Etat d'inscription utilisateur
- Progression utilisateur par cours

### Course detail

- Detail du cours
- Chapitres
- Lecons
- Blocs de contenu
- Ressources
- Progression utilisateur
- Statut de verrouillage/deblocage

### Library

- Livres
- Ressources PDF
- Ressources externes
- URLs de lecture
- URLs de telechargement

### Quizzes

- Quiz disponibles
- Examens disponibles
- Nombre de tentatives
- Meilleur score
- Seuil de reussite
- Etat de completion

### Revision

- Cartes a revoir aujourd'hui
- Historique de revision
- Niveau de difficulte
- Prochaine date de revision

### Notes

- Liste des notes utilisateur
- Etat favori
- Metadonnees de mise a jour

### Badges

- Liste des badges
- Etat obtenu / verrouille
- XP gagne
- Niveau utilisateur

### Analytics

- Heures d'etude
- Progression moyenne
- Activite semaine/mois
- Progression par cours

### Notifications

- Liste des notifications
- Etat lu / non lu
- Type de notification
- Timestamp

### Settings

- Profil utilisateur
- Preferences de langue
- Preferences de notification
- Role

### IA

- Historique de conversation
- Session IA
- Messages utilisateur
- Messages assistant
- Statut de traitement

## Interfaces minimales recommandees

Le fichier [src/lib/backend-types.ts](D:\admin\MES PROJETS\les_apps\Zentrix-Academy\eduplatform\src\lib\backend-types.ts) contient les types de base attendus par le frontend.

## A faire cote backend

- Fournir des reponses JSON coherentes avec ces types
- Gerer l'authentification
- Retourner les permissions utilisateur
- Gerer la pagination
- Retourner des erreurs claires et stables
