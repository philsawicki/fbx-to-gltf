/**
 * @file Upload a ZIP to the Server to proceed to its conversion.
 * @author Philippe Sawicki
 */

(() => {

    /**
     * Add the given CSS Class to the given HTMLElement.
     *
     * @param {HTMLElement} element The HTMLElement to which to add the given CSS Class.
     * @param {String} className The CSS Class to add to the given HTMLElement.
     */
    function addClass(element, className) {
        if (element.classList) {
            element.classList.add(className);
        } else {
            element.className += ' ' + className;
        }
    }

    /**
     * Remove the given CSS Class from the given HTMLElement.
     *
     * @param {HTMLElement} element The HTMLElement from which to remove the given CSS Class.
     * @param {String} className The CSS Class to remove from the given HTMLElement.
     */
    function removeClass(element, className) {
        if (element.classList) {
            element.classList.remove(className);
        } else {
            element.className = element.className.replace(
                new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'),
                ' '
            );
        }
    }

    /**
     * Execute the given callback on DOMContentLoaded.
     *
     * @param {Function} callback Callback to execute upon DOMContentLoaded.
     */
    function onDOMReady(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    /**
     * Upload the given FormData to the given REST EndPoint.
     *
     * @param {String} url Rest EndPoint URL to which to send the given FormData.
     * @param {FormData} body Body of the POST Request to send.
     * @param {Function} onProgress Callback to execute upon upload progress.
     * @return {Promise<Object>} A Promise to be fulfilled once the Request has been sent.
     */
    function uploadFile(url, body, onProgress = () => {}) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url);

            xhr.addEventListener('load', e => {
                try {
                    const parsedResponse = JSON.parse(e.target.responseText);
                    resolve(parsedResponse);
                } catch (ex) {
                    reject(ex);
                }
            });

            xhr.addEventListener('error', e => {
                reject(e);
            });

            if (xhr.upload) {
                xhr.upload.addEventListener('progress', onProgress);
            }

            xhr.send(body);
        });
    }

    /**
     * Upload the ZIP file to the Service.
     *
     * @return {Promise<Object>} A Promise to be fulfilled once the ZIP file has been uploaded.
     */
    function uploadZIPFile() {
        const uploadProgressBar = document.getElementById('uploadProgressBar');
        const uploadFileElement = document.getElementById('uploadFile');

        const files = uploadFileElement.files;
        const formData = new FormData();

        if (files.length > 0) {
            const file = files[0];
            formData.append('uploadFile', file, file.name);
        }

        return uploadFile('/upload', formData, e => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded * 100 / e.total).toFixed();
                uploadProgressBar.innerHTML = `${percentComplete}%`;
                uploadProgressBar.style.width = `${percentComplete}%`;
            }
        });
    }

    /**
     * Wait for the given delay.
     *
     * @param {Number} [delay=250] Delay to wait for (in milliseconds).
     * @return {Promise<void>} A Promise to be fulfilled after the given amount of time.
     */
    function wait(delay = 250) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Get the stat of the given Job.
     *
     * @param {Number} jobID ID of the Job to check.
     * @return {Promise<String|null>} A Promise to be fulfilled with the Status of the job.
     */
    async function checkJobStatus(jobID) {
        const response = await fetch(`/api/jobs/status/${jobID}`);
        if (response.ok) {
            const jobStatus = await response.json();
            if (jobStatus && jobStatus.job) {
                return jobStatus.job.state;
            }
        }

        return null;
    }

    /**
     * Handle a Job entering its "inactive" State.
     *
     * @param {Number} jobID ID of the Job to handle.
     */
    function handleInactiveJob(jobID) {
        document.getElementById('jobStatusInactive').removeAttribute('hidden');
    }

    /**
     * Handle a Job entering its "active" State.
     *
     * @param {Number} jobID ID of the Job to handle.
     */
    function handleActiveJob(jobID) {
        document.getElementById('jobStatusInactive').setAttribute('hidden', 'hidden');
        document.getElementById('jobStatusActive').removeAttribute('hidden');
        addClass(document.getElementById('conversion-animation'), 'fa-spin');
    }

    /**
     * Handle a Job entering its "complete" State.
     *
     * @param {Number} jobID ID of the Job to handle.
     */
    function handleCompleteJob(jobID) {
        document.getElementById('jobStatusActive').setAttribute('hidden', 'hidden');
        document.getElementById('jobStatusComplete').removeAttribute('hidden');
        removeClass(document.getElementById('conversion-animation'), 'fa-spin');

        const downloadGLTFURL = `/api/jobs/download/${jobID}`;
        const viewGLTFURL = `/view/${jobID}`;
        document.getElementById('downloadGLTFLink').setAttribute('href', downloadGLTFURL);
        document.getElementById('viewGLTFLink').setAttribute('href', viewGLTFURL);
        document.getElementById('gltfPresentationLinks').removeAttribute('hidden');
    }

    /**
     * Handle a Job entering its "failed" State.
     *
     * @param {Number} jobID ID of the Job to handle.
     * @param {String} [errorMessage=''] Optional error message to display to the User.
     */
    function handleFailedJob(jobID, errorMessage = '') {
        document.getElementById('jobStatusInactive').setAttribute('hidden', 'hidden');
        document.getElementById('jobStatusActive').setAttribute('hidden', 'hidden');
        document.getElementById('jobStatusComplete').setAttribute('hidden', 'hidden');
        removeClass(document.getElementById('conversion-animation'), 'fa-spin');

        document.getElementById('errorDetails').innerHTML = errorMessage;
        document.getElementById('jobStatusFailed').removeAttribute('hidden');
    }

    /**
     * Manage the remote Job's lifecycle.
     *
     * @param {Number} jobID ID of the Job to handle.
     * @param {Function} onJobStatusChange Callback to execute upon changing the Status of a Job.
     * @return {Promise<void>} A Promise to be fulfilled once the Job's lifecycle is complete.
     */
    async function manageJobLifecycle(jobID, onJobStatusChange = () => {}) {
        let oldJobStatus = 'inactive';

        let jobStatus = await checkJobStatus(jobID);
        do {
            await wait();
            jobStatus = await checkJobStatus(jobID);

            if (jobStatus !== null && jobStatus !== oldJobStatus) {
                onJobStatusChange(jobStatus, oldJobStatus);
                oldJobStatus = jobStatus;
            }
        } while (jobStatus !== 'failed' && jobStatus !== 'complete');
    }

    /**
     * Send the ZIP file to the server.
     *
     * @return {Promise} A Promise to be fulfilled once the ZIP file has been uploaded.
     */
    async function sendZIPToServer() {
        const uploadZIPButton = document.getElementById('uploadZIP');
        const progressBarContainer = document.getElementById('progressBarContainer');

        addClass(uploadZIPButton, 'disabled');
        progressBarContainer.removeAttribute('hidden');

        try {
            const response = await uploadZIPFile();
            if (response.success) {
                const uploadFormFieldset = document.getElementById('uploadFormFieldset');
                uploadFormFieldset.setAttribute('disabled', 'disabled');

                const jobID = response.jobID;

                handleInactiveJob(jobID);

                manageJobLifecycle(jobID, (newStatus, oldStatus) => {
                    if (newStatus === 'active') {
                        handleActiveJob(jobID);
                    } else if (newStatus === 'complete') {
                        handleCompleteJob(jobID);
                    } else if (newStatus === 'failed') {
                        handleFailedJob(jobID, response.err || response.message);
                    }
                });
            } else {
                handleFailedJob(-1, response.err || response.message);
            }
        } catch (ex) {
            console.error(ex);

            handleFailedJob(-1, 'An error occured while uploading the ZIP file.');
        }
    }

    /**
     * Validate the Form before proceeding to upload.
     */
    function validateForm() {
        const uploadFileElement = document.getElementById('uploadFile');
        if (uploadFileElement !== null) {
            if (uploadFileElement.files && uploadFileElement.files.length > 0) {
                sendZIPToServer();
            } else {
                addClass(uploadFileElement.parentElement, 'has-danger');
            }
        }
    }

    /**
     * Register Event Listeners to the DOM.
     */
    function registerEventListeners() {
        const uploadFileElement = document.getElementById('uploadFile');
        if (uploadFileElement !== null) {
            // Make sure to remove any previously-set validation errors if a file
            // is added:
            uploadFileElement.addEventListener('change', e => {
                if (uploadFileElement.files && uploadFileElement.files.length > 0) {
                    removeClass(uploadFileElement.parentElement, 'has-danger');
                }
            }, false);
        }

        const uploadZIPButton = document.getElementById('uploadZIP');
        const progressBarContainer = document.getElementById('progressBarContainer');
        if (uploadZIPButton !== null && progressBarContainer !== null) {
            uploadZIPButton.addEventListener('click', e => {
                e.preventDefault();

                validateForm();
            }, false);
        }
    }

    /**
     * Bootstrap the Application.
     */
    onDOMReady(() => {
        registerEventListeners();
    });
})();
