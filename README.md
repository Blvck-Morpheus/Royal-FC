# Royal FC Asaba All-Stars Club Website

A digital hub for Royal FC Asaba All-Stars Club that centralizes player information, tracks intra-club tournaments, showcases stats, and engages the local community.

## Project Overview

This website serves as the digital home for an amateur football club in Asaba, Nigeria, with approximately 40 members. It aims to foster community, fitness, and competitive unity within the club through various digital features.

### Core Features

- **Player Profiles**: Comprehensive player information including stats, positions, and achievements
- **Tournaments**: Management of various intra-club tournament formats
- **Leaderboards**: Performance tracking and recognition for top players
- **Team Generator**: Balanced team creation for matches and tournaments
- **Admin Panel**: Restricted access for managing match results and player data

## Tech Stack

- **Frontend**: React with TypeScript
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query
- **Routing**: Wouter
- **Backend**: Express.js
- **Database**: PostgreSQL (via Drizzle ORM)
- **Hosting**: Replit

## Tournament System

The website supports multiple tournament formats to facilitate intra-club competitions:

### 1. Mini-League (5-a-side/7-a-side)

Round-robin format where teams play against each other, with points awarded for wins and draws. The system tracks:

- Team standings (points, wins, draws, losses)
- Goal difference
- Individual player contributions
- Final league positions

**Implementation Details:**
- Tournament creation with team registration
- Fixture generation
- Match result recording
- Automatic table updates
- Player stat accumulation

### 2. Knockout Tournament

Single or double elimination format where teams advance through rounds until a champion is determined.

**Implementation Details:**
- Bracket generation
- Advancement tracking
- Finals highlighting
- Winner recognition

### 3. Group Stage + Knockout

Initial group play followed by knockout rounds for top finishers from each group.

**Implementation Details:**
- Group creation and team assignment
- Group standings calculation
- Qualification determination
- Knockout stage progression

## Team Generator

The team generator creates balanced teams for matches and tournaments based on:

- Player skill ratings
- Positions
- Historical performance
- Team chemistry

**Features:**
- Support for different formats (5-a-side, 7-a-side, 11-a-side)
- Multiple balancing methods
- Option to save generated teams for tournaments
- Competition mode to track team performance over time

## Getting Started

### Prerequisites

- Node.js (v20+)
- npm or yarn
- PostgreSQL (optional for local development)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Royal-FC
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5000`

## Project Structure

```
Royal FC/
├── client/                 # Frontend code
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── layouts/        # Page layouts
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   └── App.tsx         # Main application component
│   └── index.html          # HTML entry point
├── server/                 # Backend code
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data storage implementation
│   └── index.ts            # Server entry point
├── shared/                 # Shared code between client and server
│   └── schema.ts           # Database schema and types
└── attached_assets/        # Static assets
```

## API Endpoints

### Players

- `GET /api/players` - Get all players
- `GET /api/players/:id` - Get player by ID
- `POST /api/players` - Create new player
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player

### Tournaments

- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/:id` - Get tournament by ID
- `POST /api/tournaments` - Create new tournament
- `PUT /api/tournaments/:id` - Update tournament
- `DELETE /api/tournaments/:id` - Delete tournament

### Fixtures

- `GET /api/fixtures` - Get all fixtures
- `GET /api/fixtures/upcoming` - Get upcoming fixtures
- `GET /api/fixtures/active` - Get active fixtures
- `POST /api/fixtures` - Create new fixture
- `PUT /api/fixtures/:id` - Update fixture

### Match Results

- `POST /api/match-results` - Record match result

### Team Generator

- `POST /api/team-generator` - Generate balanced teams

## Authentication

The system uses a simple authentication system for admin access:

- Admin login with username/password
- Session-based authentication
- Role-based access control (admin, exco)

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT

## Contact

For questions or support, please contact the project maintainers.
