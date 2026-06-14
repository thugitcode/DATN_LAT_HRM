const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/shift-template.controller');

router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getById);

module.exports = router;