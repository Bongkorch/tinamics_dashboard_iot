# Tinamics Energy MVP

A frontend-only responsive prototype inspired by modern energy-management and Industrial IoT UX patterns. It intentionally starts much smaller than a full FusionSolar-style platform.

## MVP scope

- Responsive App Shell
- Dashboard overview
- Live-style Energy Flow visualization
- KPI / Metric cards
- Power trend chart
- Plant list
- Device health list
- Alerts
- Design tokens through CSS variables + Tailwind semantic colors
- Mock data only

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 3
- Recharts
- Heroicons

## Run

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Information architecture

```text
Dashboard
├── Selected plant
├── Energy Flow
├── Key Metrics
├── Power Trend
├── Device Health
└── Recent Alerts

Plants
Devices
Alerts
```

## Architecture

```text
app/                  Routes/pages
components/layout/    App shell, navigation
components/dashboard/ Dashboard domain components
components/shared/    Shared reusable UI
data/mock.ts           Mock frontend data
lib/                   Utilities
types/                 Domain types
```

The UI is separated from mock data so a later integration can replace `data/mock.ts` with API/query hooks without redesigning the pages.

## Suggested next phases

1. Plant Detail page
2. Device Detail page
3. Energy time filters (Today / Month / Year)
4. Alarm filtering and acknowledgement UI
5. Authentication mock / role switching (Owner vs Engineer)
6. Replace mock data with REST API
7. Add real-time layer via WebSocket/MQTT gateway

## Design principle

**Advanced engineering technology made understandable.**

Owner-level overview comes first. Engineering data should be available through drill-down rather than overwhelming the dashboard.

## UI preferences added

- Language toggle: EN / TH (English is the first-use default)
- Thai translations are centralized in `locales/th.ts`
- Light / dark theme toggle with sun and moon icons
- Theme and language preferences are stored in browser `localStorage`
- New `Notifications` page for workspace/system messages
- New `Settings` page for appearance and language preferences
- Existing operational `Alerts` remain separate from general notifications
- Responsive behavior is preserved: desktop sidebar, tablet/mobile header controls, and mobile bottom navigation
