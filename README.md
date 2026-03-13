# Imperfect

Imperfect is a pixel-art decision survival game about balancing health, money, work pressure, and environmental collapse.

You play through day-by-day choices where short-term gains can create long-term damage across your family, factory, and island.

## Core Gameplay

- Manage competing systems: `health`, `job security`, `AQI`, `sea water level`, and `treadmill of production`.
- Choose daily actions such as working, resting, cleanup, overtime, and sleep.
- Respond to event popups that force tradeoffs.
- Survive as long as possible before loss conditions trigger game over.

## Screen Flow

1. **Start Screen**
2. **Dashboard**
3. **Save Slot Selection** (3 slots)
4. **Main Game Screen**
5. **End / Game Over Screen**

## Features

- Pixel-art HUD and menu system (no glassmorphism)
- Animated water-level overlay tied to sea-level stats
- In-game clock visualization
- Tooltip-driven stat explanations
- Pause menu with:
  - `Resume`
  - `Save and Quit`
- Local save slots with metadata:
  - Load existing
  - Start new if empty
  - Delete slot (with confirmation)
- Background music with persistent playback across all screens after first user interaction

## Tech Stack

- React
- Vite
- Plain CSS (pixel-themed design system)
- LocalStorage for persistence

## Project Structure

```text
src/
  app/                # app shell and screen/state flow
  assets/audio/       # background music + credits
  features/
    audio/            # music controller hook
    game/             # game state, reducer, game components
    save/             # save-slot persistence service
  screens/            # Start, Dashboard, Game, End screens
  theme/              # global design tokens and styling
  ui/                 # reusable pixel UI components + icons
```

## Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Save Data

Save data is stored in browser `localStorage` under a game-specific key. Clearing browser storage will remove save slots.

## Credits

Background music: **"Loading Screen Loop"** by Brandon Morris (CC0 Public Domain), via OpenGameArt.
