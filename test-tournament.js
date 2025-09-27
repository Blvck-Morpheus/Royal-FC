// Test script for tournament creation and team management
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testTournament = {
  name: "Test Championship 2024",
  startDate: "2024-07-01",
  endDate: "2024-07-15",
  description: "Test tournament for functionality verification",
  format: "5-a-side",
  maxTeams: 4,
  registrationDeadline: "2024-06-25"
};

const testTeam = {
  name: "Test Team Alpha",
  captainId: 1,
  playerIds: [1, 2, 3, 4, 5]
};

async function testTournamentAPI() {
  console.log('🏆 Testing Tournament Creation & Team Management...\n');

  try {
    // Test 1: Get all tournaments
    console.log('1. Testing GET /api/tournaments');
    const tournamentsResponse = await axios.get(`${BASE_URL}/tournaments`);
    console.log(`✅ Found ${tournamentsResponse.data.length} tournaments`);
    console.log('Tournaments:', tournamentsResponse.data.map(t => ({ id: t.id, name: t.name, status: t.status })));

    // Test 2: Get all players (needed for team creation)
    console.log('\n2. Testing GET /api/players');
    const playersResponse = await axios.get(`${BASE_URL}/players`);
    console.log(`✅ Found ${playersResponse.data.length} players`);
    console.log('Players:', playersResponse.data.map(p => ({ id: p.id, name: p.name, position: p.position })));

    // Test 3: Create a new tournament
    console.log('\n3. Testing POST /api/tournaments');
    try {
      const createTournamentResponse = await axios.post(`${BASE_URL}/tournaments`, testTournament);
      console.log('✅ Tournament created successfully');
      console.log('Created tournament:', createTournamentResponse.data);
      
      const tournamentId = createTournamentResponse.data.id;

      // Test 4: Get tournament by ID
      console.log('\n4. Testing GET /api/tournaments/:id');
      const tournamentResponse = await axios.get(`${BASE_URL}/tournaments/${tournamentId}`);
      console.log('✅ Tournament retrieved successfully');
      console.log('Tournament details:', tournamentResponse.data);

      // Test 5: Create a team for the tournament
      console.log('\n5. Testing POST /api/tournament-teams');
      const teamData = {
        ...testTeam,
        tournamentId: tournamentId
      };
      
      try {
        const createTeamResponse = await axios.post(`${BASE_URL}/tournament-teams`, teamData);
        console.log('✅ Team created successfully');
        console.log('Created team:', createTeamResponse.data);

        // Test 6: Get tournament teams
        console.log('\n6. Testing GET /api/tournaments/:id/teams');
        const teamsResponse = await axios.get(`${BASE_URL}/tournaments/${tournamentId}/teams`);
        console.log('✅ Tournament teams retrieved successfully');
        console.log('Teams:', teamsResponse.data);

      } catch (teamError) {
        console.log('❌ Team creation failed:', teamError.response?.data || teamError.message);
      }

    } catch (tournamentError) {
      console.log('❌ Tournament creation failed:', tournamentError.response?.data || tournamentError.message);
    }

    // Test 7: Test team generation
    console.log('\n7. Testing POST /api/team-generator');
    const teamGenRequest = {
      format: "5-a-side",
      playerIds: playersResponse.data.slice(0, 10).map(p => p.id),
      balanceMethod: "mixed",
      teamsCount: 2,
      considerHistory: true,
      competitionMode: true,
      matchType: "tournament"
    };

    try {
      const generatedTeamsResponse = await axios.post(`${BASE_URL}/team-generator`, teamGenRequest);
      console.log('✅ Teams generated successfully');
      console.log('Generated teams:', generatedTeamsResponse.data.map(t => ({
        name: t.name,
        playerCount: t.players.length,
        captain: t.captain?.name,
        totalSkill: t.totalSkill
      })));
    } catch (genError) {
      console.log('❌ Team generation failed:', genError.response?.data || genError.message);
    }

  } catch (error) {
    console.log('❌ API test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running on port 5000');
      console.log('   Run: npm run dev');
    }
  }
}

// Run the tests
testTournamentAPI();
