// routes/staff.routes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/staff.controller');

router.get('/',           ctrl.getAll);    // GET  /staff
router.get('/:id',        ctrl.getById);   // GET  /staff/:id
router.post('/',          ctrl.create);    // POST /staff
router.patch('/:id',      ctrl.update);    // PATCH /staff/:id
//router.delete('/:id',     ctrl.delete);    // DELETE /staff/:id
router.post('/import',    ctrl.import);    // POST /staff/import

module.exports = router;