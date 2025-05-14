# Admin Panel Documentation

This document provides detailed information about the Admin Panel implemented for the Royal FC Asaba All-Stars Club website.

## Overview

The Admin Panel is a restricted area of the website that allows authorized users to manage players, tournaments, match results, and other aspects of the club's digital presence. It's designed to be user-friendly while providing powerful management capabilities.

## Access Control

The Admin Panel uses a simple authentication system:

1. **Roles**:
   - `admin`: Full access to all features
   - `exco`: Limited access to match results and team generation

2. **Authentication Flow**:
   - User navigates to `/admin`
   - Login form requires username and password
   - Server validates credentials
   - Session is established for authenticated users

## Admin Panel Sections

### 1. Match Results

This section allows admins to record match results and player statistics.

#### Features:
- Select fixture from dropdown
- Enter final score
- Record goal scorers and other statistics
- Update match status

#### Implementation:

```tsx
const MatchResultForm = () => {
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [goalScorers, setGoalScorers] = useState<{playerId: string, goals: number}[]>([]);
  
  // Fetch fixtures and players
  const { data: fixtures } = useQuery<Fixture[]>({
    queryKey: ['/api/fixtures/upcoming'],
  });
  
  const { data: players } = useQuery<Player[]>({
    queryKey: ['/api/players'],
  });
  
  // Form submission
  const onSubmit = async (data: MatchResultFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Include goal scorers in the submission
      data.scorers = goalScorers;
      
      const response = await apiRequest("POST", "/api/match-results", data);
      
      if (response.ok) {
        // Success handling
      }
    } catch (error) {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render form
  return (
    // JSX implementation
  );
};
```

### 2. Live Updates

This section allows admins to provide real-time updates during matches.

#### Features:
- Select active match
- Update current score
- Add key match events
- Toggle match status

#### Implementation:

```tsx
const LiveMatchAdmin = () => {
  const [selectedMatch, setSelectedMatch] = useState<Fixture | null>(null);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  
  // Fetch active matches
  const { data: activeMatches } = useQuery<Fixture[]>({
    queryKey: ['/api/fixtures/active'],
  });
  
  // Update score
  const updateScore = async () => {
    if (!selectedMatch) return;
    
    try {
      const response = await apiRequest("PUT", `/api/fixtures/${selectedMatch.id}`, {
        homeTeamScore: homeScore,
        awayTeamScore: awayScore
      });
      
      if (response.ok) {
        // Success handling
      }
    } catch (error) {
      // Error handling
    }
  };
  
  // Render form
  return (
    // JSX implementation
  );
};
```

### 3. Player Management

This section allows admins to manage player profiles and statistics.

#### Features:
- Add new players
- Edit existing player information
- Update player statistics
- Delete players (with confirmation)

#### Implementation:

The player management functionality is integrated into the PlayersPage with admin controls that appear when an admin is logged in:

```tsx
const PlayersPage = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  
  // Check if user is logged in as admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/check-auth");
        if (response.ok) {
          const userData = await response.json();
          if (userData.role === "admin") {
            setIsAdminMode(true);
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };

    checkAuth();
  }, []);
  
  // CRUD operations for players
  // ...
  
  return (
    // JSX implementation with conditional admin controls
  );
};
```

### 4. Tournament Management

This section allows admins to create and manage tournaments.

#### Features:
- Create new tournaments
- Add teams to tournaments
- Generate fixtures
- Update tournament status

#### Implementation:

The tournament management is accessible through the admin panel with dedicated forms for tournament creation and management.

### 5. Team Generator

This section provides access to the team generator with admin privileges.

#### Features:
- Generate balanced teams
- Save teams to tournaments
- Record team performance
- Adjust balancing parameters

## Server-Side Implementation

### Authentication Middleware

```typescript
// Simple in-memory session storage for admin authentication
let adminSession: { authenticated: boolean } = { authenticated: false };

// Admin login endpoint
app.post("/api/admin/login", async (req, res) => {
  try {
    const schema = z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    });
    
    const validatedData = schema.parse(req.body);
    const user = await storage.getUserByUsername(validatedData.username);
    
    if (!user || user.password !== validatedData.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Set admin as authenticated
    adminSession.authenticated = true;
    
    res.json({ message: "Login successful" });
  } catch (error) {
    // Error handling
  }
});

// Authentication check middleware
const requireAuth = (req, res, next) => {
  if (!adminSession.authenticated) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Protected routes
app.post("/api/match-results", requireAuth, async (req, res) => {
  // Implementation
});
```

### Admin API Endpoints

```typescript
// Check authentication status
app.get("/api/admin/check-auth", async (req, res) => {
  if (adminSession.authenticated) {
    // In a real app, we'd get the user from the session
    const user = await storage.getUserByUsername("admin");
    res.json({ authenticated: true, role: user?.role || "exco" });
  } else {
    res.json({ authenticated: false });
  }
});

// Logout endpoint
app.post("/api/admin/logout", async (req, res) => {
  adminSession.authenticated = false;
  res.json({ message: "Logged out successfully" });
});
```

## User Interface Components

### Admin Login Form

```tsx
const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest("POST", "/api/admin/login", {
        username,
        password
      });
      
      if (response.ok) {
        window.location.reload(); // Refresh to show admin panel
      } else {
        const data = await response.json();
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    // Login form JSX
  );
};
```

### Admin Tabs Interface

```tsx
const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Check authentication on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/check-auth");
        const data = await response.json();
        
        if (data.authenticated) {
          setIsAuthenticated(true);
          setCurrentUser({
            id: 1, // Placeholder
            username: "admin", // Placeholder
            role: data.role,
            createdAt: new Date()
          });
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };
    
    checkAuth();
  }, []);
  
  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin />;
  }
  
  // Show admin panel with tabs
  return (
    <Tabs defaultValue="match-results">
      <TabsList>
        <TabsTrigger value="match-results">Match Results</TabsTrigger>
        <TabsTrigger value="live-updates">Live Updates</TabsTrigger>
        {currentUser?.role === "admin" && (
          <>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
          </>
        )}
      </TabsList>
      
      <TabsContent value="match-results">
        <MatchResultForm />
      </TabsContent>
      
      <TabsContent value="live-updates">
        <LiveMatchAdmin />
      </TabsContent>
      
      {/* Other tab contents */}
    </Tabs>
  );
};
```

## Best Practices

1. **Security First**: Always validate user permissions before allowing actions
2. **Data Validation**: Validate all input data on both client and server
3. **Confirmation**: Require confirmation for destructive actions
4. **Feedback**: Provide clear feedback for all admin actions
5. **Mobile Friendly**: Ensure admin panel works well on mobile devices

## Future Enhancements

1. **Enhanced Authentication**: Implement JWT or session-based auth with proper password hashing
2. **Audit Logging**: Track all admin actions for accountability
3. **Bulk Operations**: Add support for batch updates and imports
4. **Role-Based Permissions**: More granular control over admin capabilities
5. **Admin Dashboard**: Add analytics and overview statistics
