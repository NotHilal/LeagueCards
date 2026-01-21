# League Cards - Yu-Gi-Oh! Style Card Game

A web-based card game with Yu-Gi-Oh! mechanics featuring League of Legends champions.

## Features

- **Solo Mode**: Battle against AI opponents
- **Multiplayer Mode**: Play against friends in real-time
- **Shop**: Browse and collect champion cards
- **20 Unique Cards**: Featuring League of Legends champions and summoner spells
- **Beautiful UI**: League of Legends themed interface with animations

## Tech Stack

**Frontend:**
- React with TypeScript
- Vite
- Tailwind CSS
- Framer Motion (animations)
- Socket.io Client
- React Router

**Backend:**
- Node.js
- Express
- Socket.io
- CORS

## Getting Started

### 1. Install Dependencies

First, install dependencies for both client and server:

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 2. Start the Game (Easy Method - Windows)

Simply double-click **`start.bat`** in the root folder!

This will automatically:
- Start the backend server on port 3001
- Start the frontend client (port will be shown in the window)
- Open both in separate command windows

To stop all servers, double-click **`stop.bat`**

### 3. Start Manually (Alternative)

**Start the Backend Server:**

From the `server` directory:

```bash
npm run dev
```

The server will start on `http://localhost:3001`

**Start the Frontend Client:**

Open a new terminal and from the `client` directory:

```bash
npm run dev
```

The client will start on `http://localhost:5173` (or another port if that's in use)

### 4. Play the Game

Open your browser and navigate to `http://localhost:5173`

## How to Play

### Game Basics

- **Life Points**: Start with 8000 LP. Reduce opponent to 0 to win
- **Deck**: 30 cards shuffled at game start
- **Hand**: Draw 5 cards initially, 1 per turn
- **Field**: 5 Monster Zones + 5 Spell/Trap Zones

### Card Types

**Monster Cards** - Summon to attack or defend
- Normal summon once per turn
- Attack Position or Defense Position
- ATK/DEF stats determine battle outcome

**Spell Cards** - Activate for immediate effects
- Place in Spell/Trap zone and activate

**Trap Cards** - Set face-down to activate later
- Must be set for one turn before activation

### Solo Mode

- Face off against a simple AI opponent
- AI will automatically play cards and end turns
- Practice your strategies!

### Multiplayer Mode

1. Enter your summoner name
2. Create a room or join an existing one
3. Wait for an opponent
4. Game starts automatically when room is full

## Available Cards

### Champions (Monsters)

- **Garen** (Lv6, 2500 ATK) - Gain 500 LP once per turn
- **Lux** (Lv5, 2000 ATK) - Destroy opponent's Spell/Trap when attacking
- **Darius** (Lv7, 2800 ATK) - Deal 500 damage when destroying a monster
- **Yasuo** (Lv6, 2400 ATK) - Negate opponent's Spell Cards
- **Ahri** (Lv5, 1900 ATK) - Take control of opponent's monster
- **Zed** (Lv6, 2300 ATK) - Attack twice per Battle Phase
- **Jinx** (Lv5, 2100 ATK) - Deal 300 damage when summoned
- **Ezreal** (Lv4, 1700 ATK) - Deal 200 damage per Spell activation
- **Thresh** (Lv6, 2200 ATK) - Steal monsters from opponent's Graveyard
- **Ashe** (Lv5, 1900 ATK) - Prevent Trap activation when attacking

### Spells

- **Flash** - Change battle position
- **Ignite** - Deal 800 damage
- **Teleport** - Special Summon from hand
- **Heal** - Gain 1000 LP
- **Baron Buff** - All monsters gain 500 ATK

### Traps

- **Exhaust** - Negate attack and halve monster's ATK
- **Hextech Trap** - Return summoned monster to hand
- **Stopwatch** - Prevent monster destruction
- **Ward Reveal** - Look at opponent's Set cards
- **Guardian Angel** - Revive destroyed monster

## Project Structure

```
cardgame/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── MainMenu.tsx
│   │   │   ├── GameBoard.tsx
│   │   │   ├── Multiplayer.tsx
│   │   │   ├── Shop.tsx
│   │   │   └── Card.tsx
│   │   ├── App.tsx
│   │   └── index.css
│   └── package.json
├── server/              # Node.js backend
│   ├── src/
│   │   ├── index.js    # Express + Socket.io server
│   │   └── cards.js    # Card database
│   └── package.json
└── shared/             # Shared types
    └── types/
        └── index.ts    # TypeScript interfaces
```

## Future Enhancements

- Card animations and effects
- More champions and cards
- Deck builder
- User accounts and progression
- Ranked matchmaking
- Card rarity system
- Sound effects and music
- Mobile responsive design improvements

## Notes

- This is a fan project and is not affiliated with Riot Games
- Card images are placeholders (emojis) - replace with actual artwork
- Game logic is simplified from actual Yu-Gi-Oh! rules
- AI is basic and can be improved

Enjoy the game!
