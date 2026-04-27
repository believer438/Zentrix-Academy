# Required API Endpoints

Ce document liste les endpoints backend necessaires pour alimenter tout le frontend sans simulation.

## Conventions

- Base URL exemple: `/api`
- JSON en entree/sortie
- Authentification recommandee: `Authorization: Bearer <token>`
- Cote frontend Vite, definir l'URL du backend dans `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
```
- Si votre backend expose deja le prefixe `/api`, le frontend construira ensuite les routes comme:
  - `GET ${VITE_API_BASE_URL}/api/dashboard`
  - `POST ${VITE_API_BASE_URL}/api/auth/login`

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
    "activeStreak": 0
  },
  "recentCourses": [],
  "weeklyActivity": [],
  "focusItems": [],
  "aiShortcuts": []
}
```

- Exemple plus proche du dashboard actuel:
```json
{
  "user": {
    "id": "usr_1",
    "fullName": "User Name"
  },
  "stats": {
    "enrolledCourses": 12,
    "studyHours": 48,
    "activeStreak": 8
  },
  "recentCourses": [
    {
      "id": "course_1",
      "title": "Architecture frontend",
      "progress": 68,
      "meta": "Module 4 sur 8"
    }
  ],
  "weeklyActivity": [
    { "day": "L", "value": 42 },
    { "day": "M", "value": 64 }
  ],
  "focusItems": [
    "Reprendre un cours incomplet",
    "Passer un quiz de revision"
  ],
  "aiShortcuts": [
    "Expliquer un concept",
    "Resumer une lecon"
  ]
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

### `GET /api/library/books/:bookId/access`

- Role: recuperer les liens de lecture et de telechargement
- Response exemple:
```json
{
  "bookId": "book_1",
  "readUrl": "https://cdn.example.com/read/book_1",
  "downloadUrl": "https://cdn.example.com/download/book_1.pdf",
  "expiresAt": "2026-04-09T12:00:00.000Z"
}
```

### `GET /api/library/categories`

- Role: lister les categories de la bibliotheque pour les filtres ou facettes

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

### `POST /api/quizzes/:quizId/resume`

- Role: reprendre une tentative en cours
- Response exemple:
```json
{
  "attemptId": "attempt_123",
  "status": "in_progress",
  "remainingTime": 820
}
```

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

### `GET /api/notes/:noteId`

- Role: recuperer le detail complet d'une note
- Utile pour l'ecran principal de lecture/edition

### `PATCH /api/notes/:noteId`

- Role: modifier une note

### `DELETE /api/notes/:noteId`

- Role: supprimer une note

### `PATCH /api/notes/:noteId/favorite`

- Role: marquer / demarquer comme favori

### `DELETE /api/notes/:noteId/favorite`

- Role: retirer le statut favori si vous preferez une API REST explicite

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

### `GET /api/notifications/unread-count`

- Role: recuperer rapidement le compteur de non lues pour la sidebar, le header ou le bootstrap

## IA / Chat

### `GET /api/ai/conversations`

- Role: lister les conversations IA de l'utilisateur
- Query params recommandés:
  - `page`
  - `limit`
  - `contextCourseId`

### `GET /api/ai/conversations/:conversationId/messages`

- Role: recuperer l'historique

### `POST /api/ai/conversations`

- Role: creer une conversation
- Body exemple:
```json
{
  "title": "Nouveau chat",
  "contextCourseId": "course_123"
}
```

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

### `PATCH /api/ai/conversations/:conversationId`

- Role: renommer ou mettre a jour les metadonnees d'une conversation

### `DELETE /api/ai/conversations/:conversationId`

- Role: supprimer ou archiver une conversation

## IA / Document

### `POST /api/ai/documents`

- Role: uploader un document pour analyse IA
- Content-Type recommande: `multipart/form-data`
- Champs recommandes:
  - `file`
  - `title`

### `POST /api/ai/documents/:documentId/analyze`

- Role: lancer une analyse sur un document importe
- Body exemple:
```json
{
  "actions": ["explain", "quiz", "logic"],
  "instruction": "Explique ce document comme a un debutant"
}
```

### `GET /api/ai/documents/:documentId`

- Role: recuperer les metadonnees d'un document importe

### `GET /api/ai/documents/:documentId/status`

- Role: connaitre l'etat de traitement de l'analyse
- Valeurs possibles par exemple:
  - `uploaded`
  - `processing`
  - `completed`
  - `failed`

### `GET /api/ai/documents/:documentId/result`

- Role: recuperer le resultat principal de l'analyse
- Response exemple:
```json
{
  "documentId": "doc_1",
  "summary": "Resume structure du document",
  "explanation": "Explication detaillee",
  "logicBreakdown": "Analyse logique",
  "generatedQuiz": []
}
```

### `GET /api/ai/documents/:documentId/questions`

- Role: recuperer les questions/reponses generees pour le panneau lateral

### `DELETE /api/ai/documents/:documentId`

- Role: supprimer un document importe ou son analyse

## Endpoint agregateur optionnel

### `GET /api/bootstrap`

- Role: precharger les donnees essentielles au premier chargement
- Peut inclure:
  - utilisateur courant
  - preferences
  - compteur notifications non lues
  - dashboard resume
  - conversation IA recente

## Reponses d'erreur recommandees

Pour garder le frontend stable, standardiser les erreurs:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Le document demande est introuvable.",
    "details": null
  }
}
```

Codes utiles a prevoir:
- `UNAUTHORIZED`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `RESOURCE_NOT_FOUND`
- `UPLOAD_FAILED`
- `AI_PROCESSING_FAILED`
- `RATE_LIMITED`

## Minimum backend pour rendre l'application utilisable

1. `GET /api/auth/me`
2. `GET /api/dashboard`
3. `GET /api/courses`
4. `GET /api/courses/:courseId`
5. `GET /api/notifications`
6. `GET /api/quizzes`
7. `GET /api/notes`
8. `GET /api/revision/cards/today`
9. `GET /api/library/books`
10. `GET /api/analytics/overview`
11. `POST /api/ai/conversations`
12. `POST /api/ai/conversations/:conversationId/messages`
13. `POST /api/ai/documents`
14. `POST /api/ai/documents/:documentId/analyze`
