const express = require('express');
const router = express.Router();
const taxController = require('../controllers/tax.controller');

router.get('/', taxController.getConfig);
router.put('/', taxController.updateConfig);

module.exports = router;