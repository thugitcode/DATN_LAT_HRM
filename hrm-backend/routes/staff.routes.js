const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/staff.controller');

router.get('/',          ctrl.getAll);
router.post('/:id/send-account', ctrl.sendAccount);
router.get('/:id',       ctrl.getById);
router.post('/import',   ctrl.import);
router.post('/',         ctrl.create);
router.patch('/:id',     ctrl.update);

module.exports = router;