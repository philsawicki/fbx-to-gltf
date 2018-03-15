import queue from './instance';
import { generateUUID } from '../utilities';
import { JOB_NAME } from './converter-job-settings';


/**
 * Create a Conversion Job from the provided data.
 *
 * @param {Object} data Metadata from which to create the Job.
 * @return {Promise<kue.Job>} A Promise to be fullfiled with the created kue Job.
 */
export function createConverterJob(data) {
    data.uniqueID = data.uniqueID || generateUUID();
    data.title = `Converter Job for "${data.originalFilename}"`;

    return new Promise((resolve, reject) => {
        // Bind the "converterJob" variable to this scope in order to access it
        // properly in the ".save()" block when transpiling for tests:
        let converterJob;

        converterJob = queue
            .create(JOB_NAME, data)
            .priority('high')
            .attempts(1)
            .backoff(true)
            .removeOnComplete(false)
            .save(err => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(converterJob);
                }
            });
    });
}
