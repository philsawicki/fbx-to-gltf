import kue from 'kue';


let redisConfig = {
    redis: {
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_HOST
    }
};
if (process.env.NODE_ENV === 'production') {
    redisConfig = {
        redis: {
            port: process.env.REDIS_PORT,
            host: process.env.REDIS_HOST,
            auth: process.env.REDIS_PASS,
            options: {
                no_ready_check: false
            }
        }
    };
}


const queue = kue.createQueue(redisConfig);
queue.watchStuckJobs(10 * 1000);

queue.on('ready', () => {
    console.log('Queue is ready!');
});

queue.on('error', err => {
    console.error('There was an error in the main queue!');
    console.error(err);
    console.error(err.stack);
});


// Signal all workers to stop processing after their current active job is done.
// Workers will wait "timeout" milliseconds for their active job's "done" to be
// called or mark the active job as "failed" with "shutdown" error reason.
process.once('SIGINT', sig => {
    queue.shutdown(5 * 1000, err => {
        console.log('Kue shutdown: ', err || '');
        process.exit(0);
    });
});


export default queue;
