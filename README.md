# Balancr Frontend

React + TypeScript + Vite frontend voor de `balancr-api` Spring Boot backend.

## Projectstructuur

```
src/
  components/   Herbruikbare UI-componenten (TaskForm, TaskItem, TaskList)
  pages/        Schermen per route (TasksPage)
  routes/       react-router route-definities
  services/     API-laag: axios instance (apiClient) + functies per resource (taskService)
  hooks/        Custom hooks die de service-laag aan React state koppelen (useTasks)
  types/        TypeScript types die overeenkomen met de backend DTO's (Task)
```

## Vereisten

- Node.js 18+
- De `balancr-api` backend draaiend (zie hieronder)

## Opstarten

### 1. Backend (balancr-api)

```bash
cd ../balancr-api
./gradlew bootRun
```

De API draait standaard op `http://localhost:8080`. CORS staat open voor `http://localhost:5173`
(instelbaar via `app.cors.allowed-origins` in `application.properties`).

### 2. Frontend

```bash
cp .env.example .env   # pas VITE_API_BASE_URL aan indien nodig
npm install
npm run dev
```

De frontend draait op `http://localhost:5173` en praat met de API via de URL in `.env`.

## Environment variabelen

| Variabele            | Omschrijving                          | Default                       |
| --------------------- | -------------------------------------- | ------------------------------ |
| `VITE_API_BASE_URL`   | Basis-URL van de balancr-api (incl. `/api`) | `http://localhost:8080/api` |

## API-laag

- `src/services/apiClient.ts` — axios instance met `baseURL` uit `VITE_API_BASE_URL` en een response-interceptor
  die fouten omzet naar een `ApiError` met leesbare boodschap.
- `src/services/taskService.ts` — één functie per endpoint (`getTasks`, `getTask`, `createTask`, `updateTask`, `deleteTask`).
- `src/hooks/useTasks.ts` — koppelt de service-laag aan React state (loading/error/data) voor gebruik in pagina's.

Een nieuw endpoint toevoegen (bijv. voor een nieuwe resource `Category`):

1. Voeg het type toe in `src/types/category.ts`.
2. Maak `src/services/categoryService.ts` met functies die `apiClient` gebruiken.
3. Maak (optioneel) een hook `src/hooks/useCategories.ts` die state beheert.
4. Bouw een pagina in `src/pages/` en registreer de route in `src/routes/AppRoutes.tsx`.

## Beschikbare scripts

- `npm run dev` — start de dev-server
- `npm run build` — type-check en bouwt een productie-build
- `npm run lint` — lint met oxlint
- `npm run preview` — preview van de productie-build
