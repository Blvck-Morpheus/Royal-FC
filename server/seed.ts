import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD || 'admin123', 12);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: 'admin'
    }
  });
  console.log('✅ Created admin user:', admin.username);

  // Create exco user
  const excoPassword = await bcrypt.hash(process.env.DEFAULT_EXCO_PASSWORD || 'exco123', 12);
  const exco = await prisma.user.upsert({
    where: { username: 'exco' },
    update: {},
    create: {
      username: 'exco',
      password: excoPassword,
      role: 'exco'
    }
  });
  console.log('✅ Created exco user:', exco.username);

  // Create players
  const players = [
    { name: "Khalifa", position: "Goalkeeper", jerseyNumber: 1, skillRating: 4 },
    { name: "Lamptey", position: "Defender", jerseyNumber: 2, skillRating: 3 },
    { name: "Arnold", position: "Defender", jerseyNumber: 3, skillRating: 2 },
    { name: "Collins", position: "Midfielder", jerseyNumber: 4, skillRating: 2 },
    { name: "Sureboy", position: "Defender", jerseyNumber: 5, skillRating: 3 },
    { name: "Chuks", position: "Defender", jerseyNumber: 6, skillRating: 4 },
    { name: "Simon", position: "Forward", jerseyNumber: 7, skillRating: 4 },
    { name: "Happy", position: "Midfielder", jerseyNumber: 8, skillRating: 3 },
    { name: "Zico", position: "Forward", jerseyNumber: 9, skillRating: 4 },
    { name: "Ugo", position: "Midfielder", jerseyNumber: 10, skillRating: 3 },
    { name: "Shedrach", position: "Forward", jerseyNumber: 11, skillRating: 4 },
    { name: "Onochie", position: "Defender", jerseyNumber: 12, skillRating: 3 },
    { name: "Uche", position: "Forward", jerseyNumber: 14, skillRating: 3 },
    { name: "IK", position: "Defender", jerseyNumber: 15, skillRating: 2 },
    { name: "Onose", position: "Defender", jerseyNumber: 16, skillRating: 3 },
    { name: "Vdm", position: "Defender", jerseyNumber: 17, skillRating: 3 },
    { name: "Henry", position: "Midfielder", jerseyNumber: 18, skillRating: 3 },
    { name: "Ibori", position: "Forward", jerseyNumber: 19, skillRating: 2 },
    { name: "Messi", position: "Midfielder", jerseyNumber: 20, skillRating: 2 },
    { name: "Levino", position: "Forward", jerseyNumber: 21, skillRating: 3 },
    { name: "Solibe", position: "Midfielder", jerseyNumber: 22, skillRating: 4 },
    { name: "Caleb", position: "Defender", jerseyNumber: 23, skillRating: 3 },
    { name: "Arinze", position: "Midfielder", jerseyNumber: 24, skillRating: 4 },
    { name: "Successful", position: "Defender", jerseyNumber: 25, skillRating: 2 },
    { name: "Iron Man", position: "Defender", jerseyNumber: 27, skillRating: 3 },
    { name: "Batshuayi", position: "Forward", jerseyNumber: 28, skillRating: 3 },
    { name: "Ifeanyi", position: "Forward", jerseyNumber: 29, skillRating: 2 },
    { name: "Sammy", position: "Midfielder", jerseyNumber: 30, skillRating: 2 },
    { name: "Meshack", position: "Forward", jerseyNumber: 37, skillRating: 3 },
    { name: "Ebube", position: "Goalkeeper", jerseyNumber: 45, skillRating: 2 },
    { name: "Morpheus", position: "Forward", jerseyNumber: 69, skillRating: 3 }
  ];

  for (const playerData of players) {
    await prisma.player.upsert({
      where: { jerseyNumber: playerData.jerseyNumber },
      update: {},
      create: {
        name: playerData.name,
        position: playerData.position,
        jerseyNumber: playerData.jerseyNumber,
        stats: {
          goals: 0,
          assists: 0,
          cleanSheets: 0,
          tackles: 0,
          saves: 0,
          gamesPlayed: 0,
          skillRating: playerData.skillRating,
          teamWins: 0,
          teamLosses: 0,
          teamDraws: 0
        },
        badges: []
      }
    });
  }
  console.log(`✅ Created ${players.length} players`);

  // Create a sample tournament
  const tournament = await prisma.tournament.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Summer Tournament 2024",
      status: "active",
      startDate: new Date("2024-06-01"),
      endDate: new Date("2024-06-30"),
      description: "Annual summer tournament",
      format: "5-a-side"
    }
  });
  console.log('✅ Created tournament:', tournament.name);

  // Create tournament teams
  const allPlayers = await prisma.player.findMany();
  
  const team1 = await prisma.tournamentTeam.upsert({
    where: { id: 1 },
    update: {},
    create: {
      tournamentId: tournament.id,
      name: "Team Alpha",
      captainId: allPlayers[0].id,
      played: 2,
      won: 1,
      drawn: 1,
      lost: 0,
      goalsFor: 5,
      goalsAgainst: 3,
      points: 4
    }
  });

  const team2 = await prisma.tournamentTeam.upsert({
    where: { id: 2 },
    update: {},
    create: {
      tournamentId: tournament.id,
      name: "Team Beta",
      captainId: allPlayers[1].id,
      played: 2,
      won: 0,
      drawn: 1,
      lost: 1,
      goalsFor: 3,
      goalsAgainst: 5,
      points: 1
    }
  });
  console.log('✅ Created tournament teams');

  // Create fixtures
  const fixture1 = await prisma.fixture.upsert({
    where: { id: 1 },
    update: {},
    create: {
      tournamentId: tournament.id,
      homeTeamId: team1.id,
      awayTeamId: team2.id,
      homeTeamName: team1.name,
      awayTeamName: team2.name,
      homeTeamCaptain: allPlayers[0].name,
      awayTeamCaptain: allPlayers[1].name,
      homeTeamScore: 3,
      awayTeamScore: 1,
      date: new Date("2024-06-15T14:00:00"),
      location: "Main Pitch",
      status: "completed",
      tournamentName: tournament.name
    }
  });

  const fixture2 = await prisma.fixture.upsert({
    where: { id: 2 },
    update: {},
    create: {
      tournamentId: tournament.id,
      homeTeamId: team2.id,
      awayTeamId: team1.id,
      homeTeamName: team2.name,
      awayTeamName: team1.name,
      homeTeamCaptain: allPlayers[1].name,
      awayTeamCaptain: allPlayers[0].name,
      homeTeamScore: 2,
      awayTeamScore: 2,
      date: new Date("2024-06-18T14:00:00"),
      location: "Main Pitch",
      status: "completed",
      tournamentName: tournament.name
    }
  });

  // Create upcoming fixture
  const upcomingDate = new Date();
  upcomingDate.setDate(upcomingDate.getDate() + 1); // Tomorrow
  
  await prisma.fixture.upsert({
    where: { id: 3 },
    update: {},
    create: {
      tournamentId: tournament.id,
      homeTeamId: team1.id,
      awayTeamId: team2.id,
      homeTeamName: team1.name,
      awayTeamName: team2.name,
      homeTeamCaptain: allPlayers[0].name,
      awayTeamCaptain: allPlayers[1].name,
      date: upcomingDate,
      location: "Main Pitch",
      status: "scheduled",
      tournamentName: tournament.name
    }
  });
  console.log('✅ Created fixtures');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
