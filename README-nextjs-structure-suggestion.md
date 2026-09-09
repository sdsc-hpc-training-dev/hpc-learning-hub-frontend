# Next.js Structure Suggestion

```text
hpc-learning-hub-frontend/
|-- app/
|   |-- layout.tsx
|   |-- page.tsx
|   |-- globals.css
|   |-- loading.tsx
|   |-- error.tsx
|   |-- not-found.tsx
|   |-- materials/
|   |   |-- page.tsx
|   |   `-- [materialId]/
|   |       `-- page.tsx
|   |-- programs/
|   |   `-- page.tsx
|   |-- events/
|   |   `-- page.tsx
|   |-- learning-paths/
|   |   |-- page.tsx
|   |   `-- [pathId]/
|   |       `-- page.tsx
|   |-- account/
|   |   `-- page.tsx
|   |-- my-learning/
|   |   |-- layout.tsx
|   |   |-- page.tsx
|   |   `-- conversations/
|   |       `-- page.tsx
|   |-- maintainer/
|   |   `-- page.tsx
|   `-- __tests__/
|       `-- sanity.test.tsx
|
|-- components/
|   |-- ui/
|   |   |-- Dialog.tsx
|   |   `-- StatusMessage.tsx
|   |-- layout/
|   |   |-- Header.tsx
|   |   `-- Navigation.tsx
|   |-- home/
|   |   `-- HomeView.tsx
|   |-- materials/
|   |   |-- MaterialsView.tsx
|   |   `-- MaterialDetail.tsx
|   |-- programs/
|   |   `-- ProgramsView.tsx
|   |-- events/
|   |   `-- EventsView.tsx
|   |-- learning-paths/
|   |   |-- LearningPathsView.tsx
|   |   `-- LearningPathDetail.tsx
|   |-- account/
|   |   `-- AccountPanel.tsx
|   |-- my-learning/
|   |   |-- MyLearningView.tsx
|   |   `-- ConversationHistory.tsx
|   `-- aida/
|       `-- AidaDrawer.tsx
|
|-- hooks/
|   |-- useSession.ts
|   |-- useLearning.ts
|   `-- useConversation.ts
|
|-- lib/
|   |-- gateway/
|   |   |-- client.ts
|   |   `-- types.ts
|   |-- api/
|   |   |-- catalog.ts
|   |   |-- auth.ts
|   |   |-- learning.ts
|   |   `-- aida.ts
|   `-- filters.ts
|
|-- public/
|   |-- images/
|   `-- data/
|       |-- catalog-map.json
|       `-- rendering-map.json
|
|-- types/
|-- docs/
|-- jest.config.cjs
|-- next.config.ts
|-- package.json
`-- tsconfig.json
```

Main idea:

- `app/` for routes and layouts.
- `components/` split by page.
- `hooks/` reusable client hooks.
- `lib/` API and Gateway helper logic.
- `public/` stores images and static JSON data used for mapping/rendering.
