import request from 'supertest';
import app from '../../api/app.js';
import {
  sequelize, Player, Tag,
} from '../../api/models.js';

describe('Game', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  it('create', async () => {
    const Magnus = await Player.create({
      name: 'Magnus Carlsen',
      title: 'GM',
    });
    const Hans = await Player.create({
      name: 'Hans Niemann',
      title: 'GM',
    });

    const response = await request(app)
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
      .set('Accept', 'application/json')
      .expect(200);

    expect(response.body.id).toBe(1);
    expect(response.body.moves).toBe('1. d4 d5 2. Nc3 Nf6 3. Bf4');
    expect(response.body.numMoves).toBe(5);
    expect(response.body.datePlayed).toBe('2023-01-01');
    expect(response.body.result).toBe('draw');
    expect(response.body.meta).toStrictEqual({});
    expect(response.body.whitePlayerId).toBe(1);
    expect(response.body.blackPlayerId).toBe(2);
  });

  it('get', async () => {
    const response = await request(app)
      .get('/api/games/1')
      .expect(200);

    expect(response.body.moves).toBe('1. d4 d5 2. Nc3 Nf6 3. Bf4');
  });

  describe('update', () => {
    it('date played valid', async () => {
      const response = await request(app)
        .post('/api/games/update/1')
        .send({
          datePlayed: '1998-01-29',
        })
        .expect(200);
    });

    it('date played invalid', async () => {
      const response = await request(app)
        .post('/api/games/update/1')
        .send({
          datePlayed: '1998-29-01',
        })
        .expect(500);
      expect(response.body.status).toBe('failed');
      expect(response.body.message).toBe('datePlayed invalid. Must be formatted as yyy-mm-dd.');
    });

    it('result valid', async () => {
      const response = await request(app)
        .post('/api/games/update/1')
        .send({
          result: 'white',
        })
        .expect(200);
    });

    it('result invalid', async () => {
      const response = await request(app)
        .post('/api/games/update/1')
        .send({
          result: 'not a result',
        })
        .expect(500);
      expect(response.body.status).toBe('failed');
      expect(response.body.message).toBe('result invalid. Must be one of white, black, draw.');
    });

    it('meta valid', async () => {
      const response = await request(app)
        .post('/api/games/update/1')
        .send({
          meta: { test: 'test' },
        })
        .expect(200);
    });

    it('meta invalid', async () => {
      const response = await request(app)
        .post('/api/games/update/1')
        .send({
          meta: 'not json',
        })
        .expect(500);
      expect(response.body.status).toBe('failed');
      expect(response.body.message).toBe('meta invalid. Must be JSON formatted.');
    });

    it('players', async () => {
      const response = await request(app)
        .post('/api/games/update/1')
        .send({
          whitePlayerId: 2,
          blackPlayerId: 1,
        })
        .expect(200);

      const result = await request(app)
        .get('/api/games/1');

      expect(result.body.whitePlayerId).toBe(2);
      expect(result.body.blackPlayerId).toBe(1);
    });

    it('tags', async () => {
      const tag1 = Tag.create({ name: 'win for white' });
      const tag2 = Tag.create({ name: 'short game' });
      const response = await request(app)
        .post('/api/games/update/1')
        .send({
          tags: [1, 2],
        })
        .expect(200);

      const result = await request(app)
        .get('/api/games/1');

      expect(result.body.tags).toStrictEqual([
        { id: 1, name: 'win for white' },
        { id: 2, name: 'short game' },
      ]);
    });
  });

  describe('find', () => {
    it('by tag present', async () => {
      const response = await request(app)
        .get('/api/games?tags=1,2')
        .expect(200);
      expect(response.body.games.length).toBe(1);
    });
    it('by tag not present', async () => {
      const response = await request(app)
        .get('/api/games?tags=1,3')
        .expect(200);
      expect(response.body.games.length).toBe(0);
    });
    it('by whitePlayerId with games', async () => {
      const response = await request(app)
        .get('/api/games?whitePlayerId=2')
        .expect(200);
      expect(response.body.games.length).toBe(1);
    });
    it('by whitePlayerId with no games', async () => {
      const response = await request(app)
        .get('/api/games?whitePlayerId=1')
        .expect(200);
      expect(response.body.games.length).toBe(0);
    });
    it('by blackPlayerId with games', async () => {
      const response = await request(app)
        .get('/api/games?blackPlayerId=1')
        .expect(200);
      expect(response.body.games.length).toBe(1);
    });
    it('by blackPlayerId with no games', async () => {
      const response = await request(app)
        .get('/api/games?blackPlayerId=2')
        .expect(200);
      expect(response.body.games.length).toBe(0);
    });
    it('by date range with games', async () => {
      const response = await request(app)
        .get('/api/games?startDate=1997-01-01&endDate=1999-01-01')
        .expect(200);
      expect(response.body.games.length).toBe(1);
    });
    it('by date range with no games', async () => {
      const response = await request(app)
        .get('/api/games?startDate=2000-01-01&endDate=2001-01-01')
        .expect(200);
      expect(response.body.games.length).toBe(0);
    });

    it('by result with games', async () => {
      const response = await request(app)
        .get('/api/games?result=white')
        .expect(200);
      expect(response.body.games.length).toBe(1);
    });

    it('by result with no games', async () => {
      const response = await request(app)
        .get('/api/games?result=draw')
        .expect(200);
      expect(response.body.games.length).toBe(0);
    });

    it('all with pagination', async () => {
      await Promise.all(Array.from(Array(59).keys()).map(async (i) => {
        const response = await request(app)
          .post('/api/games/create')
          .send({
            moves: '1. d4 d5 2. Nc3 Nf6 3. Bf4',
            datePlayed: '2023-01-01',
            result: 'draw',
            meta: {},
            whitePlayerId: 1,
            blackPlayerId: 2,
          })
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .expect(200);
      }));

      const responseWithData = await request(app)
        .get('/api/games?perPage=20&page=3')
        .expect(200);
      expect(responseWithData.body.games.length).toBe(20);

      const responseWithoutData = await request(app)
        .get('/api/games?perPage=20&page=4')
        .expect(200);
      expect(responseWithoutData.body.games.length).toBe(0);
    });

    it('all with sort by date', async () => {
      const asc = await request(app)
        .get('/api/games?sortBy=datePlayed&sortDir=ASC')
        .expect(200);
      const desc = await request(app)
        .get('/api/games?sortBy=datePlayed&sortDir=DESC')
        .expect(200);
      // eslint-disable-next-line max-len
      expect(new Date(asc.body.games[0].datePlayed) < new Date(desc.body.games[0].datePlayed)).toBe(true);
    });

    it('all with sort by number of moves', async () => {
      const response = await request(app)
        .post('/api/games/create')
        .send({
          moves: '1. d4 d5',
          datePlayed: '2023-01-01',
          result: 'draw',
          meta: {},
          whitePlayerId: 1,
          blackPlayerId: 2,
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(200);

      const asc = await request(app)
        .get('/api/games?sortBy=numMoves&sortDir=ASC')
        .expect(200);
      const desc = await request(app)
        .get('/api/games?sortBy=numMoves&sortDir=DESC')
        .expect(200);
      expect(asc.body.games[0].numMoves < desc.body.games[0].numMoves).toBe(true);
    });
  });

  it('delete', async () => {
    await request(app)
      .post('/api/games/delete/1')
      .expect(200);

    await request(app)
      .get('/api/games/1')
      .expect(404);
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
