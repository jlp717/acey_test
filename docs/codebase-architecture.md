# Acey Codebase Overview

## Project Structure
- `app/` – Next.js pages and high-level routes such as `match` and `training`.
- `components/` – Reusable UI components; `ui/` contains Radix based widgets.
- `hooks/` – Custom React hooks (e.g., `use-mobile.tsx`).
- `lib/` – Utility functions shared across the app.
- `public/` – Static assets served directly.
- `styles/` – Tailwind CSS setup and global styles.
- Configuration files include `next.config.mjs`, `tailwind.config.ts`, and `tsconfig.json`.

## Development
1. Install dependencies with `npm install` (or `pnpm install`).
2. Run `npm run dev` to start the Next.js server with Turbopack.
3. Build for production using `npm run build` and start with `npm run start`.

## Key Concepts
- Written in **TypeScript** and **React** using **Next.js 15**.
- Uses **Tailwind CSS** for styling and **Radix UI** components for the design system.
- The project is structured to support server components in `app/` and client components inside `components/`.

## Testing
- No automated tests are defined yet, but `npm test` is reserved for future unit tests.


## Initial Project Folder Structure
```text
acey/
├── backend/                # Firebase Functions and backend logic
│   ├── functions/
│   │   ├── src/            # API handlers and data processing
│   │   └── tests/          # Backend unit tests
│   ├── firestore/          # Firestore rules and indexes
│   └── package.json        # Backend dependencies
├── frontend/               # Next.js mobile application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── styles/         # Tailwind CSS and globals
│   │   └── utils/          # Frontend utilities
│   ├── public/             # Static assets
│   ├── tests/              # Frontend tests
│   └── package.json        # Frontend dependencies
├── common/                 # Shared types and utilities
├── ml/                     # YOLO model and AI agent code
│   ├── training/
│   └── inference/
├── sensors/                # Sensor integration and firmware
├── docs/                   # Documentation
├── scripts/                # Automation scripts
├── .github/                # CI/CD configurations
├── docker-compose.yml      # Local development setup
├── README.md               # Project instructions
└── package.json            # Root dependencies if needed
```
This structure is modular and supports future migration from Firebase to ECS while leaving room for sensor and machine learning components.
