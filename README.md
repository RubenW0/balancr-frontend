# Balancr Frontend

React + TypeScript + Vite frontend voor de `balancr-api` Spring Boot backend.

## Projectstructuur

```
src/
  components/   UI-componenten per feature (Calendar/, FixedEvents/, ActivityGoals/)
  pages/        Schermen per route (CalendarPage, FixedEventsPage, ActivityGoalsPage)
  routes/       react-router route-definities
  services/     API-laag: axios instance (apiClient) + functies per resource (fixedEventService, activityGoalService)
  hooks/        Custom hooks die de service-laag aan React state koppelen (useFixedEvents, useActivityGoals)
  types/        TypeScript types die overeenkomen met de backend DTO's (FixedEvent, ActivityGoal, AvailabilityWindow)
                en CalendarItem, het algemene type dat de agenda toont
  mappers/      Omzetten van API-data naar agenda-data (FixedEvent -> CalendarItem, availability -> businessHours)
  utils/        Hulpfuncties, o.a. datum-tijd zonder tijdzone voor de LocalDateTime-backend
```

## Weekagenda (`/calendar`)

Gebouwd met FullCalendar (`timeGridWeek`, Nederlands, week begint op maandag, 06:00 tot 24:00).

- `WeekCalendar` toont alleen `CalendarItem`s (`kind` `"FIXED"` of `"PLANNED"`) en kent `FixedEvent` niet.
  Een nieuwe bron (bijv. ingeplande sessies) voeg je toe met een mapper naar `CalendarItem` in `src/mappers/`.
- Kleuren staan in `src/components/Calendar/calendarColors.ts`: per type voor FIXED (class/work/exam/other),
  met een standaardkleur voor onbekende types, en een eigen kleur voor PLANNED.
- Bij elke weekwissel haalt de pagina `GET /api/fixed-events?from=..&to=..` op voor de zichtbare week.
- `GET /api/availability` wordt `businessHours`; tijd buiten de beschikbaarheid is grijs.
- Klik of sleep over een leeg tijdvak om een afspraak toe te voegen; klik op een afspraak om hem te
  bewerken of te verwijderen (`PUT`/`DELETE /api/fixed-events/{id}`).
- Datum-tijden worden altijd zonder tijdzone verstuurd (`2026-10-19T09:00:00`, geen `Z`).

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
  die fouten omzet naar een `ApiError` met leesbare boodschap (het `detail`-veld van `application/problem+json`).
- `src/services/fixedEventService.ts` / `activityGoalService.ts` — één functie per endpoint (bijv. `getFixedEvents`, `createFixedEvent`).
- `src/hooks/useFixedEvents.ts` / `useActivityGoals.ts` — koppelen de service-laag aan React state (loading/error/data) voor gebruik in pagina's.

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
