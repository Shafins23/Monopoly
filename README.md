# Monopoly Online

A fully playable online multiplayer Monopoly board game built with React, Tailwind CSS, and Firebase Firestore.

## Features
- **Real-time Multiplayer**: Sync game state across all devices using Firestore listeners and transactions.
- **Anonymous Play**: Join rooms instantly without an account using Firebase Anonymous Auth.
- **Room System**: Create private rooms with 6-character codes.
- **Full Ruleset**: All 40 spaces, buying, rent, houses/hotels, Chance, Community Chest, Jail, and Bankruptcy.
- **Responsive Design**: Play on Desktop, Tablet, or Mobile (with optimized board scaling).
- **Animated UX**: Dice rolls, token movement, and money transfers are all smoothly animated with Framer Motion.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion.
- **Backend/DB**: Firebase Firestore (Real-time DB).
- **Auth**: Firebase Auth (Anonymous).
- **Icons**: Lucide React.
- **Animation**: Motion (Framer Motion).

## Deployment
This app is designed to be deployed to **Cloud Run** or **Firebase Hosting**.
The `.env` file requires `GEMINI_API_KEY` (if using AI features) and Firebase config is loaded from `firebase-applet-config.json`.

## How to Play
1. Click **Create Room** and enter your name.
2. Share the room code or the URL with friends.
3. Friends click **Join Room**, enter the code, and their name.
4. Once everyone is in, the host clicks **Start Game**.
5. Take turns rolling dice, buying properties, and trying to bankrupt your friends!

---
*Built with ❤️ in AI Studio*
