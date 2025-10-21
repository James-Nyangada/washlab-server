const express = require('express');
const router = express.Router();
const { 
  createSchedule, 
  getSchedules, 
  getScheduleById, 
  updateSchedule, 
  deleteSchedule 
} = require('../controllers/scheduleController');

// Create schedule
router.post('/', createSchedule);

// Get all schedules
router.get('/', getSchedules);

// Get single schedule
router.get('/:id', getScheduleById);

// Update schedule
router.put('/:id', updateSchedule);

// Delete schedule
router.delete('/:id', deleteSchedule);

module.exports = router;
