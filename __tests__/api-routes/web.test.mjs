import request from 'supertest';
import app from '../../app';


describe('Web API', () => {
    describe('Home page', () => {
        let response;

        beforeAll(async done => {
            response = await request(app).get('/');
            done();
        });

        it('responds with an HTTP 200', () => {
            expect(response.statusCode).toEqual(200);
        });

        it('responds with an HTML "content-type" Header', () => {
            expect(response.headers['content-type']).toContain('text/html');
        });

        it('responds with an UTF-8 Charset Header', () => {
            expect(response.headers['content-type']).toContain('charset=UTF-8');
        });
    });

    describe('Upload API', () => {
        it('responds with a custom JSON message when no file was attached', async () => {
            const response = await request(app).post('/upload');

            expect(response.body).toEqual({
                success: false,
                error: null,
                message: 'Missing file'
            });
        });
    });

    describe('Viewer page', () => {
        it('responds with a custom JSON message when the Job cannot be found', async () => {
            const response = await request(app).get('/view/-1');

            expect(response.body).toEqual({
                success: false,
                error: {},
                message: 'job "-1" doesnt exist'
            });
        });
    });

    describe('Queue page', () => {
        it('does not contain an "x-powered-by" HTTP Header', async () => {
            const response = await request(app).get('/queue/active');

            expect(response.headers['x-powered-by']).not.toBeDefined();
        });
    });

    describe('Error Pages', () => {
        it('respond with an HTTP 404 when the page cannot be found', async () => {
            const response = await request(app).get('/page-that-does-not-exist');

            expect(response.statusCode).toEqual(404);
        });
    });
});
