import express from 'express';
import { requireAuth } from './middleware';
import * as controllers from './controllers';

const router = express.Router();

// Player routes
router.get('/players', controllers.getPlayers);
router.get('/players/:id', controllers.getPlayerById);
router.post('/players', requireAuth, controllers.createPlayer);
router.put('/players/:id', requireAuth, controllers.updatePlayer);
router.delete('/players/:id', requireAuth, controllers.deletePlayer);
router.get('/players/leaderboard', controllers.getLeaderboard);

// Tournament routes
router.get('/tournaments', controllers.getTournaments);
router.get('/tournaments/:id', controllers.getTournamentById);
router.post('/tournaments', requireAuth, controllers.createTournament);
router.put('/tournaments/:id', requireAuth, controllers.updateTournament);
router.delete('/tournaments/:id', requireAuth, controllers.deleteTournament);
router.get('/tournaments/active', controllers.getActiveTournaments);
router.get('/tournaments/past', controllers.getPastTournaments);

// Fixture routes
router.get('/fixtures', controllers.getFixtures);
router.get('/fixtures/:id', controllers.getFixtureById);
router.get('/fixtures/tournament/:tournamentId', controllers.getFixturesByTournament);
router.get('/fixtures/upcoming', controllers.getUpcomingFixtures);
router.get('/fixtures/active', controllers.getActiveFixtures);
router.post('/fixtures', requireAuth, controllers.createFixture);
router.put('/fixtures/:id', requireAuth, controllers.updateFixture);

// Match result routes
router.post('/match-results', requireAuth, controllers.recordMatchResult);

// Team generator routes
router.post('/team-generator', controllers.generateTeams);

// Auth routes
router.post('/admin/login', controllers.login);
router.get('/admin/check-auth', controllers.checkAuth);
router.post('/admin/logout', controllers.logout);

export default router;
