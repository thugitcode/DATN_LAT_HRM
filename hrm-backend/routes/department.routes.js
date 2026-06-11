const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/department.controller');

router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.put('/toggle/:id', ctrl.toggle);
router.delete('/:id', ctrl.delete);

module.exports = router;