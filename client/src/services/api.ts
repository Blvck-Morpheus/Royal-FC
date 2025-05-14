/**
 * API service for making HTTP requests
 */

/**
 * Make an API request
 * @param method HTTP method
 * @param url API endpoint URL
 * @param data Request body data
 * @param isFormData Whether the data is FormData
 * @returns Response object
 */
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

/**
 * API service for players
 */
export const playerService = {
  /**
   * Get all players
   */
  getPlayers: async () => {
    const response = await apiRequest('GET', '/api/players');
    if (!response.ok) {
      throw new Error('Failed to fetch players');
    }
    return response.json();
  },

  /**
   * Get player by ID
   */
  getPlayer: async (id: number) => {
    const response = await apiRequest('GET', `/api/players/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch player');
    }
    return response.json();
  },

  /**
   * Create a new player
   */
  createPlayer: async (player: any) => {
    const response = await apiRequest('POST', '/api/players', player);
    if (!response.ok) {
      throw new Error('Failed to create player');
    }
    return response.json();
  },

  /**
   * Update a player
   */
  updatePlayer: async (id: number, player: any) => {
    const response = await apiRequest('PUT', `/api/players/${id}`, player);
    if (!response.ok) {
      throw new Error('Failed to update player');
    }
    return response.json();
  },

  /**
   * Delete a player
   */
  deletePlayer: async (id: number) => {
    const response = await apiRequest('DELETE', `/api/players/${id}`);
    if (!response.ok) {
      throw new Error('Failed to delete player');
    }
    return response.json();
  }
};

/**
 * API service for tournaments
 */
export const tournamentService = {
  /**
   * Get all tournaments
   */
  getTournaments: async () => {
    const response = await apiRequest('GET', '/api/tournaments');
    if (!response.ok) {
      throw new Error('Failed to fetch tournaments');
    }
    return response.json();
  },

  /**
   * Get tournament by ID
   */
  getTournament: async (id: number) => {
    const response = await apiRequest('GET', `/api/tournaments/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tournament');
    }
    return response.json();
  },

  /**
   * Create a new tournament
   */
  createTournament: async (tournament: any) => {
    const response = await apiRequest('POST', '/api/tournaments', tournament);
    if (!response.ok) {
      throw new Error('Failed to create tournament');
    }
    return response.json();
  },

  /**
   * Update a tournament
   */
  updateTournament: async (id: number, tournament: any) => {
    const response = await apiRequest('PUT', `/api/tournaments/${id}`, tournament);
    if (!response.ok) {
      throw new Error('Failed to update tournament');
    }
    return response.json();
  }
};

/**
 * API service for fixtures
 */
export const fixtureService = {
  /**
   * Get all fixtures
   */
  getFixtures: async () => {
    const response = await apiRequest('GET', '/api/fixtures');
    if (!response.ok) {
      throw new Error('Failed to fetch fixtures');
    }
    return response.json();
  },

  /**
   * Get upcoming fixtures
   */
  getUpcomingFixtures: async () => {
    const response = await apiRequest('GET', '/api/fixtures/upcoming');
    if (!response.ok) {
      throw new Error('Failed to fetch upcoming fixtures');
    }
    return response.json();
  },

  /**
   * Get active fixtures
   */
  getActiveFixtures: async () => {
    const response = await apiRequest('GET', '/api/fixtures/active');
    if (!response.ok) {
      throw new Error('Failed to fetch active fixtures');
    }
    return response.json();
  }
};

/**
 * API service for team generator
 */
export const teamGeneratorService = {
  /**
   * Generate teams
   */
  generateTeams: async (data: any) => {
    const response = await apiRequest('POST', '/api/team-generator', data);
    if (!response.ok) {
      throw new Error('Failed to generate teams');
    }
    return response.json();
  }
};

/**
 * API service for match results
 */
export const matchResultService = {
  /**
   * Record match result
   */
  recordMatchResult: async (data: any) => {
    const response = await apiRequest('POST', '/api/match-results', data);
    if (!response.ok) {
      throw new Error('Failed to record match result');
    }
    return response.json();
  }
};

/**
 * API service for authentication
 */
export const authService = {
  /**
   * Login
   */
  login: async (username: string, password: string) => {
    const response = await apiRequest('POST', '/api/admin/login', { username, password });
    if (!response.ok) {
      throw new Error('Login failed');
    }
    return response.json();
  },

  /**
   * Check authentication status
   */
  checkAuth: async () => {
    const response = await apiRequest('GET', '/api/admin/check-auth');
    return response.json();
  },

  /**
   * Logout
   */
  logout: async () => {
    const response = await apiRequest('POST', '/api/admin/logout');
    if (!response.ok) {
      throw new Error('Logout failed');
    }
    return response.json();
  }
};
