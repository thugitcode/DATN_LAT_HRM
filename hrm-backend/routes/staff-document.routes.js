const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/staff-document.controller');

router.get('/staff/:staffId',  ctrl.getByStaff);
router.post('/staff/:staffId', ctrl.create);
router.get('/:id',             ctrl.getById);
router.patch('/:id',           ctrl.update);
router.delete('/:id',          ctrl.delete);

module.exports = router;