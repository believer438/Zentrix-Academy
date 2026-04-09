# Required API Endpoints

Ce document liste les endpoints backend necessaires pour alimenter tout le frontend sans simulation.

## Conventions

- Base URL exemple: `/api`
- JSON en entree/sortie
- Authentification recommandee: `Authorization: Bearer <token>`

## Auth

### `POST /api/auth/login`

- Role: connecter l'utilisateur
- Body:
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```
- Response:
```json
{
  "token": "jwt",
  "refreshToken": "refresh-token",
  "user": {
    "id": "usr_1",
    "fullName": "User Name",
    "role": "student"
  }
}
```

### `POST /api/auth/logout`

- Role: fermer la session

### `GET /api/auth/me`

- Role: recuperer l'utilisateur courant

## Dashboard

### `GET /api/dashboard`

- Role: fournir toutes les donnees du tableau de bord
- Response minimale:
```json
{
  "user": {},
  "stats": {
    "enrolledCourses": 0,
    "studyHours": 0,
    "quizzesPassed": 0,
    "xpPoints": 0
  },
  "recentCourses": [],
  "weeklyActivity": [],
  "recentBadges": [],
  "recommendedCourses": []
}
```

## Users / Settings

### `GET /api/users/me`

- Role: profil complet

### `PATCH /api/users/me`

- Role: modifier le profil

### `GET /api/users/me/preferences`

- Role: charger les preferences

### `PATCH /api/users/me/preferences`

- Role: modifier les preferences

## Courses

### `GET /api/courses`

- Role: lister les cours
- Query params recommandés:
  - `page`
  - `limit`
  - `search`
  - `categoryId`
  - `difficulty`
  - `enrolledOnly`
  - `featuredOnly`

### `GET /api/courses/categories`

- Role: lister les categories

### `GET /api/courses/:courseId`

- Role: detail d'un cours

### `GET /api/courses/:courseId/chapters`

- Role: lister les chapitres du cours

### `GET /api/courses/:courseId/lessons`

- Role: lister les lecons du cours

### `GET /api/lessons/:lessonId`

- Role: detail d'une lecon

### `GET /api/lessons/:lessonId/blocks`

- Role: contenu detaille d'une lecon

### `POST /api/courses/:courseId/enroll`

- Role: inscrire l'utilisateur a un cours

### `GET /api/courses/:courseId/progress`

- Role: progression utilisateur sur un cours

### `PATCH /api/courses/:courseId/progress`

- Role: mettre a jour la progression

## Library

### `GET /api/library/books`

- Role: lister les livres/ressources
- Query params recommandés:
  - `search`
  - `category`
  - `page`
  - `limit`

### `GET /api/library/books/:bookId`

- Role: detail d'une ressource

## Quizzes

### `GET /api/quizzes`

- Role: lister les quiz et examens
- Query params recommandés:
  - `type`
  - `courseId`
  - `page`
  - `limit`

### `GET /api/quizzes/:quizId`

- Role: detail d'un quiz

### `POST /api/quizzes/:quizId/start`

- Role: demarrer une tentative

### `POST /api/quizzes/:quizId/submit`

- Role: soumettre les reponses

### `GET /api/quizzes/:quizId/result`

- Role: recuperer le resultat d'une tentative

## Revision / Flashcards

### `GET /api/revision/cards/today`

- Role: recuperer les cartes a revoir aujourd'hui

### `GET /api/revision/cards`

- Role: lister toutes les cartes utilisateur

### `POST /api/revision/cards`

- Role: creer une carte

### `PATCH /api/revision/cards/:cardId/review`

- Role: enregistrer un resultat de revision
- Body:
```json
{
  "rating": "easy"
}
```

## Notes

### `GET /api/notes`

- Role: lister les notes utilisateur
- Query params recommandés:
  - `search`
  - `favorite`
  - `courseId`

### `POST /api/notes`

- Role: creer une note

### `PATCH /api/notes/:noteId`

- Role: modifier une note

### `DELETE /api/notes/:noteId`

- Role: supprimer une note

### `PATCH /api/notes/:noteId/favorite`

- Role: marquer / demarquer comme favori

## Badges

### `GET /api/badges`

- Role: lister tous les badges utilisateur

### `GET /api/users/me/xp`

- Role: recuperer l'etat de progression XP/niveau

## Analytics

### `GET /api/analytics/overview`

- Role: KPIs principaux

### `GET /api/analytics/activity`

- Role: activite semaine/mois

### `GET /api/analytics/courses-progress`

- Role: progression par cours

## Notifications

### `GET /api/notifications`

- Role: lister les notifications utilisateur
- Query params recommandés:
  - `page`
  - `limit`
  - `unreadOnly`

### `PATCH /api/notifications/:notificationId/read`

- Role: marquer une notification comme lue

### `PATCH /api/notifications/read-all`

- Role: tout marquer comme lu

## IA / Chat

### `GET /api/ai/conversations/:conversationId/messages`

- Role: recuperer l'historique

### `POST /api/ai/conversations`

- Role: creer une conversation

### `POST /api/ai/conversations/:conversationId/messages`

- Role: envoyer un message utilisateur
- Body:
```json
{
  "content": "Explique-moi ce concept",
  "contextCourseId": "course_123"
}
```

### `GET /api/ai/conversations/:conversationId/status`

- Role: connaitre l'etat du traitement IA

## Endpoint agregateur optionnel

### `GET /api/bootstrap`

- Role: precharger les donnees essentielles au premier chargement
- Peut inclure:
  - utilisateur courant
  - preferences
  - compteur notifications non lues
  - dashboard resume

## Minimum backend pour rendre l'application utilisable

1. `GET /api/auth/me`
2. `GET /api/dashboard`
3. `GET /api/courses`
4. `GET /api/courses/:courseId`
5. `GET /api/notifications`
6. `GET /api/quizzes`
7. `GET /api/notes`
8. `GET /api/revision/cards/today`
9. `GET /api/badges`
10. `GET /api/library/books`
11. `GET /api/analytics/overview`
12. `POST /api/ai/conversations/:conversationId/messages`
