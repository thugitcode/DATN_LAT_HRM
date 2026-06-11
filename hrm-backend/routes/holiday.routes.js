const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holiday.controller');

router.get('/', holidayController.getAll);
router.get('/employees', holidayController.getEmployees);
router.post('/', holidayController.create);
router.put('/:id', holidayController.update);
router.delete('/:id', holidayController.delete);

module.exports = router;