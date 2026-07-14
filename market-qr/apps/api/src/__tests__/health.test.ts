import request from 'supertest';
import { app } from '../index';

describe('GET /api/v1/health', () => {
  it('should return 200 with status ok', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});
