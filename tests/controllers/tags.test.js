import request from 'supertest';
import app from '../../api/app.js';
import { sequelize } from '../../api/models.js';

describe('Tag', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  it('create', async () => {
    const response = await request(app)
      .post('/api/tags/create')
      .send({
        name: 'berlin defense',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);

    expect(response.body.name).toBe('berlin defense');
    expect(response.body.id).toBe(1);
  });

  it('find by name', async () => {
    const response = await request(app)
      .get('/api/tags/?name=berlin')
      .expect(200);

    expect(response.body.length).toBe(1);
  });

  it('find by name no results', async () => {
    const response = await request(app)
      .get('/api/tags/?name=spanish')
      .expect(200);

    expect(response.body.length).toBe(0);
  });

  it('get', async () => {
    const response = await request(app)
      .get('/api/tags/1')
      .expect(200);

    expect(response.body.name).toBe('berlin defense');
  });

  it('delete', async () => {
    await request(app)
      .post('/api/tags/delete/1')
      .expect(200);

    await request(app)
      .get('/api/tags/1')
      .expect(404);
  });
});
