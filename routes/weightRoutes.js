// Weight Routes
const express = require('express');
const router = express.Router();
const {
    getWeights,
    getWeightsByRange,
    getLatestWeight,
    createWeight,
    updateWeight,
    deleteWeight
} = require('../controllers/weightController');

router.get('/:userId', getWeights);
router.get('/:userId/range', getWeightsByRange);
router.get('/:userId/latest', getLatestWeight);
router.post('/', createWeight);
router.put('/:id', updateWeight);
router.delete('/:id', deleteWeight);

module.exports = router;

