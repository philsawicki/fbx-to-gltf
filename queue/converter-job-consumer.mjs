import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import unzip from 'unzip';
import queue from './instance';
import { JOB_NAME } from './converter-job-settings';
import { dirlist, updateJobData, logJobMessage }  from '../utilities';


/**
 * Unzip the ZIP file received.
 *
 * @param {kue.Job} job The kue Job to process.
 * @return {Promise<kue.Job>} A Promise to be fullfiled with the processed kue Job.
 */
async function unzipStage(job) {
    const filepath = job.data.filepath;
    const unzipDestination = path.join(path.resolve('.'), 'projects', job.data.uniqueID);

    logJobMessage(job, `Starting unzipping of job #${job.data.uniqueID} to "${unzipDestination}".`);

    return new Promise((resolve, reject) => {
        fs.createReadStream(filepath)
            .pipe(unzip.Extract({ path: unzipDestination }))
            .on('error', err => {
                logJobMessage(job, `An error occured when unzipping job #${job.data.uniqueID}.`);
                reject(err);
            })
            .on('close', async () => {
                logJobMessage(job, `Completed unzipping of job #${job.data.uniqueID}.`);

                try {
                    const rootFBXFiles = (await dirlist(unzipDestination))
                        .filter(file => path.extname(file).toLowerCase() === '.fbx');

                    if (rootFBXFiles.length === 0) {
                        return reject(new Error('Could not find an FBX file at the root of the provided ZIP archive.'));
                    }

                    await updateJobData(job, {
                        fbxFilePath: rootFBXFiles[0]
                    });

                    // The archive was successfully unzipped: delete it.
                    fs.unlink(filepath, err => {
                        if (err) {
                            logJobMessage(job, `An error occured when deleting ZIP for job #${job.data.uniqueID}.`);
                            reject(err);
                        } else {
                            logJobMessage(job, `Deleted ZIP for job #${job.data.uniqueID}.`);
                            resolve(job);
                        }
                    });
                } catch (ex) {
                    reject(ex);
                }
            });
    });
}

/**
 * Convert the FBX file to glTF.
 *
 * @param {kue.Job} job The kue Job to process.
 * @return {Promise<kue.Job>} A Promise to be fullfiled with the processed kue Job.
 */
async function convertStage(job) {
    await updateJobData(job, {
        glbFileName: path.basename(job.data.fbxFilePath)
            .toLowerCase()
            .replace('.fbx', '.glb'),
        glbFilePath: job.data.fbxFilePath
            .replace('.fbx', '.glb')
    });

    const binaryDirectory = path.resolve('.');
    const outputPath = job.data.fbxFilePath
        .toLowerCase()
        .replace('.fbx', '');

    const fbx2gltfArguments = [
        '--binary',
        '--input', job.data.fbxFilePath,
        '--output', outputPath
    ];

    const spawnOptions = {
        cwd: binaryDirectory,
        shell: true
    };

    return new Promise((resolve, reject) => {
        const fbx2gltfExecutable = 'FBX2glTF-linux-x64';
        const logMessages = [];
        const errorMessages = [];

        logJobMessage(job, `Starting FBX2glTF for job #${job.data.uniqueID}.`);
        try {
            const fbx2gltfProcess = child_process.spawn(fbx2gltfExecutable, fbx2gltfArguments, spawnOptions);

            fbx2gltfProcess.stdout.on('data', data => {
                logJobMessage(job, 'PROCESS: ' + data);
                logMessages.push(data);
            });

            fbx2gltfProcess.stderr.on('data', data => {
                logJobMessage(job, 'ERROR: ' + data);
                errorMessages.push(data);
            });

            fbx2gltfProcess.on('exit', code => {
                if (errorMessages.length === 0 && code === 0) {
                    logJobMessage(job, `Completing FBX2glTF for job #${job.data.uniqueID}.`);
                    resolve(job);
                } else {
                    const error = new Error('An error occured during the conversion.');
                    error.compilerErrors = errorMessages;
                    reject(error);
                }
            });

            fbx2gltfProcess.on('error', err => {
                reject(err);
            });
        } catch (ex) {
            reject(ex);
        }
    });
}

// Process only 1 job concurrently:
queue.process(JOB_NAME, 1, (job, done) => {
    logJobMessage(job, `Starting conversion of job #${job.data.uniqueID}.`);

    unzipStage(job)
        .then(job => convertStage(job))
        .then(() => done())
        .catch(err => done(err));
});
