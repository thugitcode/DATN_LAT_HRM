const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/work-schedule.controller');

// Specific routes TRƯỚC /:id
router.get('/calendar',                        ctrl.getCalendar);
router.get('/attendance-table',                ctrl.getAttendanceTable);
router.get('/attendance-by-hours',             ctrl.getAttendanceByHours);
router.get('/staff-daily-attendance',          ctrl.getStaffDailyAttendance);
const detailedCtrl = require('../controllers/detailed-time-sheet.controller');
router.get('/detailed-attendance-table',       detailedCtrl.getDetailedAttendanceTable);
router.get('/work-schedule-detail/:id',        ctrl.getDetail);
router.patch('/detail/:id/attendance',         ctrl.updateAttendance);
router.post('/check-conflict',                 ctrl.checkConflict);
router.get('/my-today',                        ctrl.getMyToday);
router.post('/:id/self-check-in',              ctrl.selfCheckIn);
router.post('/:id/self-check-out',             ctrl.selfCheckOut);
router.post('/range',                          ctrl.createRange);
router.get('/',                                ctrl.getAll);
router.post('/',                               ctrl.create);
router.get('/:id',                             ctrl.getById);
router.patch('/:id',                           ctrl.update);
router.delete('/:id',                          ctrl.delete);

module.exports = router;