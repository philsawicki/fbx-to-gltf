import path from 'path';
import express from 'express';
import kue from 'kue';
import multer from 'multer';
import { createConverterJob } from '../queue/converter-job';

const router = express.Router();
const upload = multer({ dest: path.join(path.resolve('.'), 'tmp') });


router.get('/', (req, res) => {
    const uploadForm = path.join(path.resolve('.'), 'views', 'upload.html');
    res.sendFile(uploadForm);
});

router.post('/upload', upload.single('uploadFile'), (req, res) => {
    const data = req.body;

    if (req.file) {
        data.originalFilename = req.file.originalname;
        data.filepath = req.file.path;

        createConverterJob(data)
            .then(jobData => {
                res.json({
                    success: true,
                    error: null,
                    message: 'Job created.',
                    jobID: jobData.id
                });
            })
            .catch(err => {
                res.json({
                    success: false,
                    error: err,
                    message: 'Could not create job.'
                });
            });
    } else {
        res.json({
            success: false,
            error: null,
            message: 'Missing file'
        });
    }
});

router.get('/view/:jobID', (req, res) => {
    kue.Job.get(req.params.jobID, (err, job) => {
        if (err) {
            res.json({
                success: false,
                error: err,
                message: err.message
            });
        } else {
            res.render('view', {
                file: {
                    glbFilePath: `/${job.data.uniqueID}/${job.data.glbFileName}`
                }
            });
        }
    });
});


export default router;
