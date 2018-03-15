import express from 'express';
import kue from 'kue';

const router = express.Router();


router.get('/jobs/status/:jobID', (req, res) => {
    kue.Job.get(req.params.jobID, (err, job) => {
        if (err) {
            res.json({
                success: false,
                error: err,
                message: err.message
            });
        } else {
            res.json({
                success: true,
                error: null,
                message: '',
                job: job
            });
        }
    });
});

router.get('/jobs/download/:jobID', (req, res) => {
    kue.Job.get(req.params.jobID, (err, job) => {
        if (err) {
            res.json({
                success: false,
                error: err,
                message: err.message
            });
        } else {
            res.download(job.data.glbFilePath);
        }
    });
});


export default router;
