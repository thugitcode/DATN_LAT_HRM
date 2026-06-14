const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/tax.controller');

router.get('/',        ctrl.getConfig);
router.put('/',        ctrl.updateConfig);
router.get('/rate',    ctrl.getRate);
router.get('/bracket', ctrl.getBrackets);

module.exports = router;