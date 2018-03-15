import request from 'supertest';
import app from '../../app';


describe('Healthcheck API', () => {
    describe('/healthcheck', () => {
        it('responds with an HTTP 200 when the service is up', async () => {
            const response = await request(app).get('/healthcheck');

            expect(response.statusCode).toEqual(200);
        });

        it('responds with a JSON body', async () => {
            const response = await request(app).get('/healthcheck');

            expect(response.body).toEqual({ healthy: true });
        });
    });
});
