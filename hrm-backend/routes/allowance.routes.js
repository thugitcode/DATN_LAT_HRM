const express = require('express');
const router = express.Router();
const allowanceController = require('../controllers/allowance.controller');

router.get('/', allowanceController.getAll);
router.get('/:id', allowanceController.getDetail);
router.post('/', allowanceController.create);
router.put('/:id', allowanceController.update);
router.put('/toggle/:id', allowanceController.toggleStatus);
router.delete('/:id', allowanceController.delete);

module.exports = router;