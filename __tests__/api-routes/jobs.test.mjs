import request from 'supertest';
import app from '../../app';


describe('Jobs API', () => {
    describe('/api/jobs/status/:jobID', () => {
        it('responds with a custom JSON message when the Job cannot be found', async () => {
            const response = await request(app).get('/api/jobs/status/-1');

            expect(response.body).toEqual({
                success: false,
                error: {},
                message: 'job "-1" doesnt exist'
            });
        });
    });

    describe('/api/jobs/download/:jobID', () => {
        it('responds with a custom JSON message when the Job cannot be found', async () => {
            const response = await request(app).get('/api/jobs/download/-1');

            expect(response.body).toEqual({
                success: false,
                error: {},
                message: 'job "-1" doesnt exist'
            });
        });
    });
});
