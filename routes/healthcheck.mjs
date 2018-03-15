import express from 'express';

const router = express.Router();


router.get('/', (req, res) => {
    res.json({
        healthy: true
    });
});


export default router;
