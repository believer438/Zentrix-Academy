# Zentrix Academy — `educplateforme`

Plateforme d'apprentissage React + Vite (TypeScript, Tailwind v4, lucide-react, react-router-dom).

## Stack
- React 18 + Vite 7
- Tailwind CSS v4
- react-router-dom v6 (BrowserRouter, base = `/`)
- lucide-react pour les icônes
- Composants UI maison sous `src/components/ui/`

## Charte visuelle
- **Bordures carrées** partout : `rounded-2xl/3xl/xl` ont été remplacés par `rounded-none`. Conserver `rounded-full` (badges, avatars) et `rounded-md/sm` (champs subtils).
- Couleurs : orange `#FF6B00` / `#FFB347`, slate sombre, blanc.
- Hero (`PageHero.tsx`) : image de fond, gradient sombre, barre d'accent orange à gauche, optionnel eyebrow en majuscules tracking.

## Données simulées
`src/lib/mock-data.ts` expose :
- `mockCourses` (8 cours)
- `buildChaptersForCourse(course)` (chapitres + leçons)
- `buildLessonSegments(course)` (sections d'une leçon avec heading, paragraphes, vidéo)
- `mockBooks` (6 ressources)
- `mockQuizzes` (4 quiz)
- `mockNotifications` (4 notifications)

Les vidéos d'exemple proviennent du CDN public Google `commondatastorage.googleapis.com/gtv-videos-bucket/sample/*.mp4`.

## Structure cours
Chaque leçon est composée de **sections** (par défaut 5). Chaque section contient :
1. Un titre
2. Plusieurs paragraphes explicatifs
3. Une vidéo intégrée (`<video controls>`) avec titre, description, durée

Le composant `CourseDetail.tsx` :
- Sidebar gauche : plan du cours (chapitres/leçons accordéon) + nav vers chaque section
- Hero local pour la leçon en cours
- Liste des sections avec scroll, IntersectionObserver met à jour la section active dans la sidebar
- CTA « Demander à l'IA » et « Marquer comme terminée »

## Workflow
- Workflow : `artifacts/educplateforme: web`
- Commande : `pnpm --filter @workspace/educplateforme run dev`
- Port : `18401` (lecture via `process.env.PORT`)
- Vite : `host 0.0.0.0`, `allowedHosts: true`

## Notes
- Dashboard.tsx fait un `fetch('/api/courses')` (pour la barre Explorer) ; échoue silencieusement quand l'API server n'est pas lancé.
- Auth modal côté droit reste ouvert tant que l'utilisateur ne clique pas sur X — comportement existant à conserver pour la démo.
- Toutes les pages secondaires (Library, Quizzes, Notes, Notifications, Revision, Analytics, Settings) ont été enrichies avec données simulées et heroes professionnels.
