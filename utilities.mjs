import fs from 'fs';
import path from 'path';


/**
 * Generate a UUID v4-compatible GUID.
 *
 * @return {String} A UUID v4-compatible GUID.
 */
export function generateUUID() {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });

    return uuid;
}

/**
 * Return the list of files immediately at the root of the given directory.
 *
 * @param {String} dir Full path of the directory from which to retrieve the
 * list of files.
 * @return {Promise<String[]>} A Promise to be fulfilled with the full paths of
 * the files immediately at the root of the given directory.
 */
export function dirlist(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, fileNames) => {
            if (err) {
                reject(err);
            } else {
                const fullPaths = fileNames.map(file => path.join(dir, file));
                resolve(fullPaths);
            }
        });
    });
}

/**
 * Delete the given file from the given directory.
 *
 * @param {String} dir Full path of the directory from which to delete the given
 * filen name.
 * @param {String} file Name of the file to delete from the given directory
 * path.
 * @return {Promise<void>} A Promise to be fulfilled once the given file has
 * been deleted from the given directory.
 */
export function deleteFile(dir, file) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(dir, file);
        fs.lstat(filePath, (err, stats) => {
            if (err) {
                reject(err);
            } else {
                if (stats.isDirectory()) {
                    resolve(deleteDirectory(filePath));
                } else {
                    fs.unlink(filePath, err => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                }
            }
        });
    });
}

/**
 * Delete the given directory path.
 *
 * This deletes all files in the given directory before removing the directory
 * itself.
 *
 * @param {String} dir Full path of the directory to delete.
 * @return {Promise<void>} A Promise to be fulfilled once the given directory
 * has been deleted.
 */
export function deleteDirectory(dir) {
    return new Promise((resolve, reject) => {
        fs.access(dir, err => {
            if (err) {
                return reject(err);
            }
            fs.readdir(dir, (err, files) => {
                if (err) {
                    return reject(err);
                }

                Promise.all(
                    files.map(file => deleteFile(dir, file))
                )
                    .then(() => {
                        fs.rmdir(dir, err => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    })
                    .catch(reject);
            });
        });
    });
}

/**
 * Set the given data on the Job before persisting it.
 *
 * @param {ke.Job} job Job to update.
 * @param {Object} [data={}] Data to set to the Job.
 */
export function updateJobData(job, data = {}) {
    return new Promise((resolve, reject) => {
        job.data = { ...job.data, ...data };

        job.update(err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Log the given message to the given Job.
 *
 * @param {kue.Job} job Job on which to print the message.
 * @param {String|Number} message Message to print to the Job.
 */
export function logJobMessage(job, message) {
    const formattedMessage = `[${new Date().toISOString()}] ${message}`;
    job.log(formattedMessage);
}
