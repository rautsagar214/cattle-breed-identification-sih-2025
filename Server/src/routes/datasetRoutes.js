const express = require('express');
const router = express.Router();
const datasetController = require('../controllers/datasetController');

router.post('/generate-dataset', datasetController.generateDataset);
router.get('/dataset-versions', datasetController.getDatasetVersions);

module.exports = router;
