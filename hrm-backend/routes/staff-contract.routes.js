const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/staff-contract.controller');

router.get('/staff/:staffId',   ctrl.getByStaff);   // GET  /staff-contract/staff/:staffId
router.get('/:id',              ctrl.getById);       // GET  /staff-contract/:id
router.post('/',                ctrl.create);        // POST /staff-contract
router.patch('/:id',            ctrl.update);        // PATCH /staff-contract/:id
router.post('/:id/approve',     ctrl.approve);       // POST /staff-contract/:id/approve
router.post('/:id/sign',        ctrl.sign);          // POST /staff-contract/:id/sign
router.delete('/:id',           ctrl.delete);        // DELETE /staff-contract/:id

module.exports = router;