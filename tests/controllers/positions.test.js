import request from 'supertest';
import app from '../../api/app.js';
import {
  sequelize, Game, Player, Tag,
} from '../../api/models.js';
import * as utils from '../../api/utils.js';

describe('Position', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  it('find all', async () => {
    const Magnus = await Player.create({
      name: 'Magnus Carlsen',
      title: 'GM',
    });
    const Hans = await Player.create({
      name: 'Hans Niemann',
      title: 'GM',
    });

    await request(app)
      .post('/api/games/create')
      .send({
        moves: '1. d4 d5 2. Nc3 Nf6 3. Bf4',
        datePlayed: '2023-01-01',
        result: 'draw',
        meta: {},
        whitePlayerId: Magnus.id,
        blackPlayerId: Hans.id,
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    utils.wait(1000);

    const allpositions = await request(app).get('/api/positions').expect(200);
    expect(allpositions.body.length).toBe(6);
  });

  it('get', async () => {
    const response = await request(app)
      .get(`/api/positions/${encodeURIComponent('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')}`)
      .expect(200);

    expect(response.body.id).toBe(1);
    expect(response.body.fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(response.body.gamesWonByWhite).toBe(0);
    expect(response.body.gamesWonByBlack).toBe(0);
    expect(response.body.gamesDrawn).toBe(1);
    expect(response.body.movesPlayed).toStrictEqual(['d4']);
  });

  it('update', async () => {

  });

  it('find by tag', async () => {

  });

  afterAll(async () => {
    await sequelize.close();
  });
});
