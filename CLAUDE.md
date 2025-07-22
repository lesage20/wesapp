# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- **Start development server**: `npm start` (starts Expo dev client)
- **Run on iOS**: `npm run ios`
- **Run on Android**: `npm run android`
- **Web development**: `npm run web`
- **Lint and format check**: `npm run lint`
- **Auto-fix formatting**: `npm run format`
- **Prebuild native code**: `npm run prebuild`

## Build Commands (EAS)

- **Development build**: `npm run build:dev`
- **Preview build**: `npm run build:preview`
- **Production build**: `npm run build:prod`

## Architecture Overview

This is a React Native Expo app using:

- **Routing**: Expo Router with file-based routing
- **Navigation**: Drawer + Tab navigation structure (`(drawer)` -> `(tabs)`)
- **Styling**: NativeWind (Tailwind CSS for React Native) + global CSS
- **State Management**: Zustand store (see `store/store.ts`)
- **TypeScript**: Strict mode enabled with path aliases (`~/` points to root)
- **Package Manager**: pnpm

## Project Structure

- `app/`: File-based routing with Expo Router
  - `(drawer)/`: Drawer navigation wrapper
  - `(tabs)/`: Tab navigation screens
  - `_layout.tsx`: Root layout with navigation setup
- `components/`: Reusable UI components
- `store/`: Zustand state management
- `assets/`: Images, icons, and static assets

## Key Configuration

- **Expo Config**: `app.json` with dev client and typed routes enabled
- **Build Config**: `eas.json` with development, preview, and production profiles
- **TypeScript**: Path aliases configured (`~/*` -> `*`)
- **Styling**: TailwindCSS configured for app and components directories

## Development Notes

- Uses Expo development client (not Expo Go)
- NativeWind requires the `nativewind-env.d.ts` type definitions
- Project uses typed routes for better TypeScript integration