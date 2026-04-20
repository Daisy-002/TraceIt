# Lost & Found Hub

A React application for campus/community lost and found items.

## Problem
Lost items posted on WhatsApp groups get buried quickly. This app provides a centralized platform to post found and lost items with photos, locations, and dates, and includes matching logic to alert users when potential matches are found.

## Features
- User authentication with Firebase
- Post found/lost items with images (stored as base64 in Firestore)
- Real-time search and filter using useMemo
- Complex matching logic based on keywords from descriptions
- Responsive UI with Tailwind CSS
- Routing with React Router

## Tech Stack
- React 19
- TypeScript
- Vite
- Firebase (Auth, Firestore)
- Tailwind CSS
- React Router DOM

## Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Firebase project and update `src/services/firebase.ts` with your config
4. Run development server: `npm run dev`
5. Build for production: `npm run build`

## Project Structure
- `src/components/` - Reusable components
- `src/pages/` - Page components
- `src/hooks/` - Custom hooks
- `src/context/` - React context for state management
- `src/services/` - Firebase configuration
- `src/utils/` - Types and utilities
