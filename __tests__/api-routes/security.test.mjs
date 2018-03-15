import request from 'supertest';
import app from '../../app';


/**
 * Get a key/value pair list of HTTP Headers for the given application path. All
 * header key/value are forced to lowercase, with the assumption that all header
 * names are unique regardless of casing.
 *
 * @param {String} path Application path to test.
 * @return {Promise<Object>} A Promise to be fulfilled with the list of
 * lowercase key/value Header pairs.
 */
async function getLowercaseHTTPHeaders(path) {
    const response = await request(app).get(path);

    const lowercaseHeaders = Object.entries(response.headers)
        .reduce((accumulator, [headerName, headerValue]) => {
            accumulator[headerName.toLowerCase()] = typeof headerValue === 'string' ? headerValue.toLowerCase() : headerValue;
            return accumulator;
        }, {});

    return lowercaseHeaders;
}


describe('Web App Security', () => {
    describe('Web front-end reponse', () => {
        let lowercaseHeaders;

        beforeAll(async done => {
            lowercaseHeaders = await getLowercaseHTTPHeaders('/');
            done();
        });

        it('does not contain a "x-powered-by" HTTP Header', () => {
            expect(lowercaseHeaders).not.toHaveProperty('x-powered-by');
        });

        it('contains a "strict-transport-security" HTTP Header', () => {
            expect(lowercaseHeaders).toHaveProperty('strict-transport-security');
        });

        it('contains a "x-download-options" HTTP Header', () => {
            expect(lowercaseHeaders).toHaveProperty('x-download-options', 'noopen');
        });

        it('contains a "x-content-type-options" HTTP Header', () => {
            expect(lowercaseHeaders).toHaveProperty('x-content-type-options', 'nosniff');
        });

        it('contains a "x-frame-options" HTTP Header', () => {
            expect(lowercaseHeaders).toHaveProperty('x-frame-options', 'sameorigin');
        });

        it('contains a "x-xss-protection" HTTP Header', () => {
            expect(lowercaseHeaders).toHaveProperty('x-xss-protection');
        });
    });
});
