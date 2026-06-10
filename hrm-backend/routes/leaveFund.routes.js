const express = require('express');
const router = express.Router();
const leaveFundController = require('../controllers/leaveFund.controller');

router.get('/', leaveFundController.getAll);
router.post('/', leaveFundController.create);
router.put('/:id', leaveFundController.update);
router.delete('/:id', leaveFundController.delete);

module.exports = router;