# Prompt Add-on for this project

Use the previously defined Master Design System as the source of truth.

For this codebase specifically:

- Preserve Next.js + TypeScript + Tailwind.
- Keep this project frontend-only until explicitly asked otherwise.
- Use `data/mock.ts` as the current data source.
- Do not add a backend, database, authentication service, MQTT broker, or API integration yet.
- Preserve the information architecture: Dashboard / Plants / Devices / Alerts.
- New UI must use semantic design tokens rather than random raw colors.
- Prefer reusable domain components over page-specific duplicates.
- Desktop, tablet, and mobile must have intentionally different information density.
- Mobile navigation should remain optimized for touch.
- Owner-friendly information should appear before engineering details.
- Future backend integration must be possible without rewriting visual components.
- Do not copy Huawei logos, proprietary assets, exact screens, or brand identity.
