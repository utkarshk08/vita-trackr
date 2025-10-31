// Activity Routes
const express = require('express');
const router = express.Router();
const {
    getActivities,
    getActivitiesByRange,
    createActivity,
    updateActivity,
    deleteActivity
} = require('../controllers/activityController');

router.get('/:userId', getActivities);
router.get('/:userId/range', getActivitiesByRange);
router.post('/', createActivity);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

module.exports = router;

