import { Router } from 'express';
import * as controllers from './controllers/index.js';

export default (app) => {
  const router = Router();

  router.get('/tags', controllers.findTags);
  router.get('/tags/:id', controllers.getTag);
  router.post('/tags/create', controllers.createTag);
  router.post('/tags/delete/:id', controllers.deleteTag);

  router.get('/players', controllers.findPlayers);
  router.get('/players/:id', controllers.getPlayer);
  router.post('/players/update/:id', controllers.updatePlayer);
  router.post('/players/create', controllers.createPlayer);
  router.post('/players/delete/:id', controllers.deletePlayer);

  router.get('/games', controllers.findGames);
  router.get('/games/:id', controllers.getGame);
  router.post('/games/update/:id', controllers.updateGame);
  router.post('/games/create', controllers.createGame);
  router.post('/games/delete/:id', controllers.deleteGame);

  router.get('/positions', controllers.findPositions);
  router.get('/positions/:fen', controllers.getPosition);
  router.post('/positions/:fen', controllers.updatePosition);

  app.use('/api', router);
};
