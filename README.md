# 🃏 Teen Patti (3 Patti) Online

A real-time multiplayer Teen Patti card game built with Next.js 14, Firebase Realtime Database, and Tailwind CSS. Play with 2–4 friends from your phone — no account needed!

## Features

- **No sign-up required** — join via shareable room code or link
- **Real-time multiplayer** — 2-4 players, synced via Firebase RTDB
- **5 game variations**: Classic, AK-47, Muflis (Lowball), Joker, Best of Four
- **Full game logic**: Blind/Seen betting, Raise, Fold, Show/Showdown
- **Mobile-first UI** — designed for phones, works on desktop too
- **Free hosting** — deploy on Vercel + Firebase free tier

## Game Variations

| Variation | Description |
|-----------|-------------|
| **Classic** | Standard Teen Patti. Trail > Pure Sequence > Sequence > Color > Pair > High Card |
| **AK-47** | All A, K, 4, 7 cards are wild jokers — substitute to form the best hand |
| **Muflis** | Lowball — hand rankings are completely reversed. High Card beats Trail! |
| **Joker** | One card is revealed; all 4 cards of that rank become wild for the round |
| **Best of Four** | Deal 4 cards, pick the best 3 to play with |

## Quick Start (Local Development)

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** (free tier is enough)
3. Give it a name (e.g., "teen-patti")
4. Disable Google Analytics (optional)
5. Click **Create**

### 2. Enable Realtime Database

1. In Firebase Console → **Build** → **Realtime Database**
2. Click **"Create Database"**
3. Choose your region
4. Select **"Start in test mode"** → Enable
5. Copy the database URL (e.g., `https://your-project-default-rtdb.firebaseio.com`)

### 3. Get Firebase Config Keys

1. In Firebase Console → **Project Settings** (gear icon) → **General**
2. Scroll to **"Your apps"** → Click **"Add app"** → Choose **Web** (</> icon)
3. Register the app (any nickname)
4. Copy the config object values

### 4. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 5. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — create a room in one tab, join from another!

## Deploy to Vercel (Free)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Teen Patti app"
git remote add origin https://github.com/your-username/teen-patti.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"New Project"** → Import your repo
3. In **Environment Variables**, add all `NEXT_PUBLIC_FIREBASE_*` keys from your `.env.local`
4. Click **Deploy**

Or use the CLI:

```bash
npx vercel --prod
```

### 3. Apply Firebase Security Rules

1. In Firebase Console → **Realtime Database** → **Rules**
2. Replace the default rules with the contents of `firebase-rules.json`
3. Click **Publish**

This ensures:
- Only `/rooms/{roomCode}` paths are readable/writable
- Root-level data is locked down
- Basic field validation on pot, currentBet, and status

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database | Firebase Realtime Database |
| State Sync | Firebase `onValue` + `runTransaction` |
| Hosting | Vercel (free tier) |
| Auth | None (localStorage-based identity) |

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page (Create/Join room)
│   └── room/[code]/       # Room page (Lobby → Game)
├── components/            # React UI components
│   ├── Card.tsx           # Single playing card
│   ├── PlayerCards.tsx    # Player's hand display
│   ├── ActionBar.tsx      # Game action buttons
│   ├── ActionLog.tsx      # Scrollable game log
│   ├── GameTable.tsx      # Main game view
│   ├── Lobby.tsx          # Pre-game lobby
│   └── WinnerModal.tsx    # Round-end winner display
├── hooks/                 # React hooks
│   ├── usePlayer.ts       # localStorage player identity
│   ├── useRoom.ts         # Firebase room subscription
│   └── useGameActions.ts  # Game action dispatching
└── lib/                   # Core game logic (pure TypeScript)
    ├── types.ts           # Type definitions
    ├── deck.ts            # Deck creation & shuffle
    ├── handEvaluator.ts   # Hand ranking engine
    ├── gameLogic.ts       # State machine & actions
    ├── firebase.ts        # Firebase singleton config
    └── firebaseOperations.ts  # RTDB transaction operations
```

## Security Note

> **⚠️ This app is designed for playing with friends, not for real-money gambling.**
> 
> Since game logic runs client-side and card data is stored in Firebase RTDB, a technically savvy player could inspect the database to see opponents' cards. This is fine for casual play with friends but not suitable for adversarial or real-money scenarios.

## How to Play

1. **Create a room** — enter your name and click "Create Room"
2. **Share the room code** — send the 6-character code or link to friends
3. **Wait in lobby** — host picks variation, boot amount, and starting chips
4. **Play!** — bet blind, see your cards, chaal, raise, or fold
5. **Showdown** — when 2 players remain, request a "Show" to compare hands
6. **Next round** — winner takes the pot, play continues until someone runs out

## License

MIT
