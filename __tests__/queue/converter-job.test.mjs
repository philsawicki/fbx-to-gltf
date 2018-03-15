import kue from 'kue';
import { createConverterJob } from '../../queue/converter-job';


const queue = kue.createQueue();

describe('Creating a "converter" Job', () => {
    let jobs;

    beforeAll(() => {
        queue.testMode.enter();
    });

    beforeEach(async done => {
        await createConverterJob({ });

        jobs = queue.testMode.jobs;
        done();
    });

    afterEach(() => {
        queue.testMode.clear();
    });

    afterAll(() => {
        queue.testMode.exit();
    });

    it('adds a Job to the queue', () => {
        expect(jobs).toHaveLength(1);
        expect(jobs[0]).toBeInstanceOf(kue.Job);
    });

    it('adds a job to the "converter-job" queue', () => {
        expect(jobs[0].type).toEqual('converter-job');
    });

    it('adds a Job to the queue with provided data', () => {
        expect(jobs[0].data).toHaveProperty('title');
        expect(jobs[0].data).toHaveProperty('uniqueID');
    });

    it('adds a Job to the queue with proper configuration', () => {
        expect(jobs[0]._max_attempts).toEqual(1);
        expect(jobs[0]._priority).toEqual(-10);
        expect(jobs[0]._backoff).toBeTruthy();
        expect(jobs[0]._removeOnComplete).toBeFalsy();
    });
});
