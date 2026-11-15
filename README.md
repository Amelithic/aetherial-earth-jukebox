# Aetherial Earth Jukebox

A Vue 3 web app created for the NASA Space Apps 2026 "Earth Jukebox" challenge. It turns Earth imagery into music by sampling image colors and brightness and mapping them to sound, presented in an interactive retro jukebox with a 3D globe visualiser.

## Features

- Sonify preset Earth datasets or upload your own image
- Interactive jukebox player with playback, speed, loop, and volume controls
- 3D globe visualiser textured with the active image
- Browse gallery and dataset detail pages
- Adjustable sonification options (mode, scale, waveform, reverb, etc.)
- Export options: WAV audio, MIDI, and MP4/WebM video (visualiser + audio; format depends on browser support)
- Shareable links to tracks

## Tech Stack

- Vue 3 + TypeScript + Vite
- Vue Router
- Three.js
- Web Audio API / MediaRecorder

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - start the development server
- `npm run build` - typecheck and create a production build
- `npm run preview` - preview the production build locally
- `npm run typecheck` - run TypeScript/Vue type checks

## Project Structure

- `src/views/` - main app pages (home, jukebox, about)
- `src/jukebox/` - jukebox browsing/detail views
- `src/components/` - reusable UI components
- `src/composables/` - audio, image processing, and sonification logic
- `src/utils/` - audio/image/mapping utilities
- `src/assets/data/` - preset datasets and imagery
