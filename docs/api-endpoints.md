# API Endpoints Documentation

This document provides detailed information about the API endpoints available in the Royal FC Asaba All-Stars Club website.

## Base URL

All API endpoints are prefixed with `/api`.

## Authentication

Some endpoints require authentication. These endpoints check if the user is authenticated using the `adminSession` object.

Authentication is handled through the following endpoints:

### Login

```
POST /api/admin/login
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful"
}
```

**Status Codes:**
- `200 OK`: Login successful
- `401 Unauthorized`: Invalid credentials
- `400 Bad Request`: Invalid input

### Check Authentication

```
GET /api/admin/check-auth
```

**Response (Authenticated):**
```json
{
  "authenticated": true,
  "role": "admin"
}
```

**Response (Not Authenticated):**
```json
{
  "authenticated": false
}
```

### Logout

```
POST /api/admin/logout
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## Players

### Get All Players

```
GET /api/players
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Jamal Okoye",
    "position": "Forward",
    "jerseyNumber": 9,
    "photoUrl": "https://example.com/photo.jpg",
    "stats": {
      "goals": 12,
      "assists": 5,
      "cleanSheets": 0,
      "tackles": 0,
      "saves": 0,
      "gamesPlayed": 18,
      "skillRating": 4
    },
    "badges": ["goldenBoot", "captain"],
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### Get Player by ID

```
GET /api/players/:id
```

**Response:**
```json
{
  "id": 1,
  "name": "Jamal Okoye",
  "position": "Forward",
  "jerseyNumber": 9,
  "photoUrl": "https://example.com/photo.jpg",
  "stats": {
    "goals": 12,
    "assists": 5,
    "cleanSheets": 0,
    "tackles": 0,
    "saves": 0,
    "gamesPlayed": 18,
    "skillRating": 4
  },
  "badges": ["goldenBoot", "captain"],
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

**Status Codes:**
- `200 OK`: Player found
- `404 Not Found`: Player not found

### Create Player

```
POST /api/players
```

**Request Body:**
```json
{
  "name": "New Player",
  "position": "Midfielder",
  "jerseyNumber": 10,
  "photoUrl": "https://example.com/photo.jpg",
  "stats": {
    "goals": 0,
    "assists": 0,
    "cleanSheets": 0,
    "tackles": 0,
    "saves": 0,
    "gamesPlayed": 0,
    "skillRating": 3
  }
}
```

**Response:**
```json
{
  "id": 2,
  "name": "New Player",
  "position": "Midfielder",
  "jerseyNumber": 10,
  "photoUrl": "https://example.com/photo.jpg",
  "stats": {
    "goals": 0,
    "assists": 0,
    "cleanSheets": 0,
    "tackles": 0,
    "saves": 0,
    "gamesPlayed": 0,
    "skillRating": 3
  },
  "badges": [],
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

**Status Codes:**
- `200 OK`: Player created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated

### Update Player

```
PUT /api/players/:id
```

**Request Body:**
```json
{
  "name": "Updated Player",
  "position": "Midfielder",
  "jerseyNumber": 10,
  "photoUrl": "https://example.com/photo.jpg",
  "stats": {
    "goals": 1,
    "assists": 2,
    "cleanSheets": 0,
    "tackles": 5,
    "saves": 0,
    "gamesPlayed": 3,
    "skillRating": 4
  }
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Updated Player",
  "position": "Midfielder",
  "jerseyNumber": 10,
  "photoUrl": "https://example.com/photo.jpg",
  "stats": {
    "goals": 1,
    "assists": 2,
    "cleanSheets": 0,
    "tackles": 5,
    "saves": 0,
    "gamesPlayed": 3,
    "skillRating": 4
  },
  "badges": [],
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

**Status Codes:**
- `200 OK`: Player updated
- `404 Not Found`: Player not found
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated

### Delete Player

```
DELETE /api/players/:id
```

**Response:**
```json
{
  "message": "Player deleted successfully"
}
```

**Status Codes:**
- `200 OK`: Player deleted
- `404 Not Found`: Player not found
- `401 Unauthorized`: Not authenticated

## Tournaments

### Get All Tournaments

```
GET /api/tournaments
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Summer Tournament",
    "status": "active",
    "startDate": "2023-06-01T00:00:00.000Z",
    "endDate": "2023-06-30T00:00:00.000Z",
    "description": "Annual summer tournament",
    "format": "5-a-side",
    "teams": [...],
    "fixtures": [...],
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### Get Tournament by ID

```
GET /api/tournaments/:id
```

**Response:**
```json
{
  "id": 1,
  "name": "Summer Tournament",
  "status": "active",
  "startDate": "2023-06-01T00:00:00.000Z",
  "endDate": "2023-06-30T00:00:00.000Z",
  "description": "Annual summer tournament",
  "format": "5-a-side",
  "teams": [...],
  "fixtures": [...],
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

**Status Codes:**
- `200 OK`: Tournament found
- `404 Not Found`: Tournament not found

### Create Tournament

```
POST /api/tournaments
```

**Request Body:**
```json
{
  "name": "New Tournament",
  "status": "active",
  "startDate": "2023-07-01T00:00:00.000Z",
  "endDate": "2023-07-31T00:00:00.000Z",
  "description": "New tournament description",
  "format": "7-a-side"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "New Tournament",
  "status": "active",
  "startDate": "2023-07-01T00:00:00.000Z",
  "endDate": "2023-07-31T00:00:00.000Z",
  "description": "New tournament description",
  "format": "7-a-side",
  "teams": [],
  "fixtures": [],
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

**Status Codes:**
- `200 OK`: Tournament created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated

## Fixtures

### Get All Fixtures

```
GET /api/fixtures
```

**Response:**
```json
[
  {
    "id": 1,
    "tournamentId": 1,
    "homeTeamId": 1,
    "awayTeamId": 2,
    "homeTeamName": "Team Alpha",
    "awayTeamName": "Team Beta",
    "homeTeamCaptain": "J. Okoye",
    "awayTeamCaptain": "K. Nduka",
    "homeTeamScore": 3,
    "awayTeamScore": 1,
    "date": "2023-06-15T14:00:00.000Z",
    "location": "Main Pitch",
    "status": "completed",
    "tournamentName": "Summer Tournament",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### Get Upcoming Fixtures

```
GET /api/fixtures/upcoming
```

**Response:**
```json
[
  {
    "id": 2,
    "tournamentId": 1,
    "homeTeamId": 3,
    "awayTeamId": 4,
    "homeTeamName": "Team Delta",
    "awayTeamName": "Team Sigma",
    "homeTeamCaptain": "K. Nduka",
    "awayTeamCaptain": "T. Chukwu",
    "homeTeamScore": null,
    "awayTeamScore": null,
    "date": "2023-06-20T14:00:00.000Z",
    "location": "Main Pitch",
    "status": "scheduled",
    "tournamentName": "Summer Tournament",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### Get Active Fixtures

```
GET /api/fixtures/active
```

**Response:**
```json
[
  {
    "id": 3,
    "tournamentId": 1,
    "homeTeamId": 1,
    "awayTeamId": 4,
    "homeTeamName": "Team Alpha",
    "awayTeamName": "Team Sigma",
    "homeTeamCaptain": "J. Okoye",
    "awayTeamCaptain": "T. Chukwu",
    "homeTeamScore": 2,
    "awayTeamScore": 2,
    "date": "2023-06-18T14:00:00.000Z",
    "location": "Main Pitch",
    "status": "in_progress",
    "tournamentName": "Summer Tournament",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
]
```

## Match Results

### Record Match Result

```
POST /api/match-results
```

**Request Body:**
```json
{
  "fixtureId": "1",
  "homeTeamScore": 3,
  "awayTeamScore": 1,
  "scorers": [
    {
      "playerId": "1",
      "goals": 2
    },
    {
      "playerId": "3",
      "goals": 1
    }
  ]
}
```

**Response:**
```json
{
  "message": "Match result recorded successfully"
}
```

**Status Codes:**
- `200 OK`: Result recorded
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated

## Team Generator

### Generate Teams

```
POST /api/team-generator
```

**Request Body:**
```json
{
  "format": "5-a-side",
  "playerIds": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  "balanceMethod": "mixed",
  "teamsCount": 2,
  "considerHistory": true,
  "competitionMode": true
}
```

**Response:**
```json
[
  {
    "name": "Team Blue",
    "players": [...],
    "totalSkill": 18,
    "matchHistory": []
  },
  {
    "name": "Team Gold",
    "players": [...],
    "totalSkill": 17,
    "matchHistory": []
  }
]
```

**Status Codes:**
- `200 OK`: Teams generated
- `400 Bad Request`: Invalid input

## Leaderboard

### Get Leaderboard

```
GET /api/players/leaderboard?category=goals
```

**Query Parameters:**
- `category`: The stat category to sort by (goals, assists, cleanSheets, tackles, saves)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Jamal Okoye",
    "position": "Forward",
    "jerseyNumber": 9,
    "photoUrl": "https://example.com/photo.jpg",
    "stats": {
      "goals": 12,
      "assists": 5,
      "cleanSheets": 0,
      "tackles": 0,
      "saves": 0,
      "gamesPlayed": 18,
      "skillRating": 4
    },
    "badges": ["goldenBoot", "captain"],
    "createdAt": "2023-01-01T00:00:00.000Z"
  },
  ...
]
```

## Contact Form

### Submit Contact Form

```
POST /api/contact
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "message": "I'm interested in joining the club",
  "joinClub": true
}
```

**Response:**
```json
{
  "message": "Contact form submitted successfully"
}
```

**Status Codes:**
- `200 OK`: Form submitted
- `400 Bad Request`: Invalid input

## Error Handling

All API endpoints follow a consistent error handling pattern:

```json
{
  "message": "Error message describing what went wrong"
}
```

For validation errors (Zod validation failures), the response includes detailed error information:

```json
{
  "message": "Invalid input",
  "errors": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["name"],
      "message": "Required"
    }
  ]
}
```

## Using the API with React Query

The frontend uses React Query to interact with the API:

```tsx
// Fetching data
const { data: players, isLoading, error } = useQuery<Player[]>({
  queryKey: ['/api/players'],
});

// Creating data
const createPlayerMutation = useMutation({
  mutationFn: async (data: PlayerFormValues) => {
    const res = await apiRequest("POST", "/api/players", data);
    return await res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/players'] });
  },
});

// Using the mutation
createPlayerMutation.mutate(formData);
```

The `apiRequest` helper function handles the HTTP requests:

```typescript
export async function apiRequest(
  method: string,
  url: string,
  data?: any,
  isFormData: boolean = false
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: !isFormData ? { 'Content-Type': 'application/json' } : undefined,
    body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    credentials: 'include'
  };

  return fetch(url, options);
}
```
