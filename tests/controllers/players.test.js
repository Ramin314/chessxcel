import request from 'supertest';
import app from '../../api/app.js';
import { sequelize } from '../../api/models.js';

describe('Player', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  it('create', async () => {
    const response = await request(app)
      .post('/api/players/create')
      .send({
        name: 'Hikaru Nakamura',
        title: 'FM',
        urls: { 'chess.com': 'http://chess.com/member/hikaru' },
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);

    expect(response.body.name).toBe('Hikaru Nakamura');
    expect(response.body.id).toBe(1);
  });

  it('update', async () => {
    const response = await request(app)
      .post('/api/players/update/1')
      .send({
        title: 'GM',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);

    expect(response.body.id).toBe('1');
    expect(response.body.status).toBe('success');
  });

  it('get', async () => {
    const response = await request(app)
      .get('/api/players/1')
      .expect(200);

    expect(response.body.title).toBe('GM');
  });

  it('find by name', async () => {
    const response = await request(app)
      .get('/api/players/?name=Hikaru')
      .expect(200);

    expect(response.body.length).toBe(1);
  });

  it('find by name no results', async () => {
    const response = await request(app)
      .get('/api/players/?name=Magnus')
      .expect(200);

    expect(response.body.length).toBe(0);
  });

  it('find by title', async () => {
    const response = await request(app)
      .get('/api/players/?title=GM')
      .expect(200);

    expect(response.body.length).toBe(1);
  });

  it('find by title no results', async () => {
    const response = await request(app)
      .get('/api/players/?title=FM')
      .expect(200);

    expect(response.body.length).toBe(0);
  });

  it('delete', async () => {
    await request(app)
      .post('/api/players/delete/1')
      .expect(200);

    await request(app)
      .get('/api/players/1')
      .expect(404);
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
