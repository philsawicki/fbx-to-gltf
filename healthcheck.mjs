import http from 'http';


/**
 * Check if the given path is reachable from the web.
 *
 * @param {String} path Path of the webpage to check for health.
 * @return {Promise<String>} A Promise to be fulfilled with the path of the page
 * checked for health.
 */
function isWebPageUp(path) {
    const options = {
        host: 'localhost',
        port: process.env.APPLICATION_PORT,
        path: path,
        timeout: 1000
    };

    return new Promise((resolve, reject) => {
        const request = http.request(options, res => {
            if (res.statusCode === 200) {
                resolve(path);
            } else {
                reject(path);
            }
        });

        request.on('error', err => {
            reject(path);
        });

        request.end();
    });
}

/**
 * Run the health check on the web server.
 *
 * @return {Promise<void>} A Promise to be fulfilled once the health check has
 * completed.
 */
function runHealthCheck() {
    return Promise.all([
        isWebPageUp('/healthcheck'),
        isWebPageUp('/queue/stats')
    ])
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

runHealthCheck();
